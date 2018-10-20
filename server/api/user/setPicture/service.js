import fs from 'fs';
import { promisify } from 'util';
import { ObjectId } from 'mongodb';
import readChunk from 'read-chunk';
import imageType from 'image-type';
import getImageSize from 'image-size';
import sharp from 'sharp';
import {
  UnprocessableImage,
  ImageTooSmall,
  ImageTooLarge,
  InvalidImageCropArea,
} from '../../../constants/errors';

const unlinkAsync = promisify(fs.unlink);
const getImageSizeAsync = promisify(getImageSize);

const acceptedTypes = new Set(['png', 'jpg', 'webp']);
export const minImageSize = 200; // px
export const maxImageSize = 10000; // px

async function setUserPicture(db, storage, { id, picture, cropSize, cropX, cropY }) {
  const UserModel = db.model('User');
  const currentDate = new Date();

  try {
    // detect image type
    const chunk = await readChunk(picture.path, 0, 12);
    const type = imageType(chunk);

    // make sure image is of valid type
    if (!type || !acceptedTypes.has(type.ext)) {
      throw new UnprocessableImage(
        'Unprocessable image type; expected one of "png", "jpg" or "webp"'
      );
    }

    // acquire image dimensions
    const dimensions = await getImageSizeAsync(picture.path);

    // make sure image is NOT too small
    if (dimensions.width < minImageSize || dimensions.height < minImageSize) {
      throw new ImageTooSmall(
        `Image too small; width/height should be at least ${minImageSize}x${minImageSize} px`
      );
    }

    // make sure image is NOT too large
    if (dimensions.width > maxImageSize || dimensions.height > maxImageSize) {
      throw new ImageTooLarge(
        `Image too large; width/height should not exceed ${maxImageSize}x${maxImageSize} px`
      );
    }

    // calculate crop size (if unspecified)
    if (!cropSize) {
      cropSize = Math.min(dimensions.width, dimensions.height);
    }

    // make sure crop size is within image size boundaries
    if (cropX + cropSize > dimensions.width || cropY + cropSize > dimensions.height) {
      throw new InvalidImageCropArea(
        'The designated crop area exceed the image width/height boundaries'
      );
    }

    // process image
    const format = type.ext === 'png' ? 'png' : 'jpeg';
    const buf = await sharp(picture.path)
      .extract({ left: cropX, top: cropY, width: cropSize, height: cropSize })
      .resize(400, 400)
      .jpeg({
        quality: 80,
      })
      .png({
        compressionLevel: 9,
      })
      .toFormat(format)
      .toBuffer();

    // persist image to storage layer
    await storage.writeFile(`${id}.${format}`, buf);

    // resolve image URL
    const nextPicture = storage.resolveUrl(`${id}.${format}`);

    // update user in db
    await UserModel.updateOne(
      {
        id: ObjectId(id),
      },
      {
        $set: {
          picture: nextPicture,
          updatedAt: currentDate,
        },
      }
    );

    return {
      id,
      picture: nextPicture,
      updatedAt: currentDate,
    };
  } finally {
    // remove temp image from fs
    await unlinkAsync(picture.path);
  }
}

export default setUserPicture;
