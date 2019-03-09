import Router from 'koa-router';
import getFile from './getFile';

const router = Router();

router.get('/media/:filename', getFile);

export default router;
