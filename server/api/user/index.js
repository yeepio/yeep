import Router from 'koa-router';
import createUser from './create';
import deleteUser from './delete';
import getUserInfo from './info';
import updateUser from './update';
import assignPermission from './assignPermission';
import revokePermission from './revokePermission';
import assignRole from './assignRole';
import revokeRole from './revokeRole';
import listUsers from './list';
import deactivateUser from './deactivate';
import activateUser from './activate';
import uploadUserPicture from './uploadPicture';
import deleteUserPicture from './deletePicture';
import forgotPassword from './forgotPassword';
import resetPassword from './resetPassword';

const router = Router();

// method signature: name, path, handler
// omit name if you want to hide this method from the api-docs
router.post('user.create', '/user.create', createUser);
router.post('user.delete', '/user.delete', deleteUser);
router.post('user.info', '/user.info', getUserInfo);
router.post('user.update', '/user.update', updateUser);
router.post('user.assignPermission', '/user.assignPermission', assignPermission);
router.post('user.revokePermission', '/user.revokePermission', revokePermission);
router.post('user.assignRole', '/user.assignRole', assignRole);
router.post('user.revokeRole', '/user.revokeRole', revokeRole);
router.post('user.list', '/user.list', listUsers);
router.post('user.deactivate', '/user.deactivate', deactivateUser);
router.post('user.activate', '/user.activate', activateUser);
router.post('user.uploadPicture', '/user.uploadPicture', uploadUserPicture);
router.post('user.deletePicture', '/user.deletePicture', deleteUserPicture);
router.post('user.forgotPassword', '/user.forgotPassword', forgotPassword);
router.post('user.resetPassword', '/user.resetPassword', resetPassword);

export default router;
