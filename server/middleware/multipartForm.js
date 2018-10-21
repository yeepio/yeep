import os from 'os';
import formidable from 'formidable';

formidable.IncomingForm.prototype.parseAsync = function(req) {
  return new Promise((resolve, reject) => {
    this.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({ fields, files });
    });
  });
};

export const parseMultipartForm = ({
  encoding = 'utf-8',
  uploadDir = os.tmpdir(),
  keepExtensions = false,
  maxFieldsSize = 20 * 1024 * 1024, // i.e. 20M
  maxFields = 100,
  hash = false,
  multiples = false,
} = {}) => async ({ req, request }, next) => {
  const form = new formidable.IncomingForm();
  form.encoding = encoding;
  form.uploadDir = uploadDir;
  form.keepExtensions = keepExtensions;
  form.maxFieldsSize = maxFieldsSize;
  form.maxFields = maxFields;
  form.hash = hash;
  form.multiples = multiples;
  const { fields, files } = await form.parseAsync(req);
  request.body = {
    ...files,
    ...fields,
  };
  await next();
};
