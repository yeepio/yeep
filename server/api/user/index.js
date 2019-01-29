import Router from 'koa-router';
import createUser from './create';
import deleteUser from './delete';
import getUserInfo from './info';
import assignPermission from './assignPermission';
import revokePermission from './revokePermission';
import assignRole from './assignRole';
import revokeRole from './revokeRole';
import listUsers from './list';
import deactivateUser from './deactivate';
import activateUser from './activate';
import setUserPicture from './setPicture';
import deleteUserPicture from './deletePicture';
import forgotPassword from './forgotPassword';
import resetPassword from './resetPassword';
import joinUser from './join';

const router = Router();

router.post('/v1/user.create', createUser);
router.post('/v1/user.delete', deleteUser);
router.post('/v1/user.info', getUserInfo);
router.post('/v1/user.assignPermission', assignPermission);
router.post('/v1/user.revokePermission', revokePermission);
router.post('/v1/user.assignRole', assignRole);
router.post('/v1/user.revokeRole', revokeRole);
router.post('/v1/user.list', listUsers);
router.post('/v1/user.deactivate', deactivateUser);
router.post('/v1/user.activate', activateUser);
router.post('/v1/user.setPicture', setUserPicture);
router.post('/v1/user.deletePicture', deleteUserPicture);
router.post('/v1/user.forgotPassword', forgotPassword);
router.post('/v1/user.resetPassword', resetPassword);
router.post('/v1/user.join', joinUser);

export default router;
