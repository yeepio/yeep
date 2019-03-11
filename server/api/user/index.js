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

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('user.create', '/v1/user.create', createUser);
router.post('user.delete', '/v1/user.delete', deleteUser);
router.post('user.info', '/v1/user.info', getUserInfo);
router.post('user.assignPermission', '/v1/user.assignPermission', assignPermission);
router.post('user.revokePermission', '/v1/user.revokePermission', revokePermission);
router.post('user.assignRole', '/v1/user.assignRole', assignRole);
router.post('user.revokeRole', '/v1/user.revokeRole', revokeRole);
router.post('user.list', '/v1/user.list', listUsers);
router.post('user.deactivate', '/v1/user.deactivate', deactivateUser);
router.post('user.activate', '/v1/user.activate', activateUser);
router.post('user.setPicture', '/v1/user.setPicture', setUserPicture);
router.post('user.deletePicture', '/v1/user.deletePicture', deleteUserPicture);
router.post('user.forgotPassword', '/v1/user.forgotPassword', forgotPassword);
router.post('user.resetPassword', '/v1/user.resetPassword', resetPassword);

export default router;
