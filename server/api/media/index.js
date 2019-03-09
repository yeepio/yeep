import Router from 'koa-router';
import getFile from './getFile';

const router = Router();

router.get('media.getFile', '/media/:filename', getFile);

export default router;
