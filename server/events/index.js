import passwordResetInit from './passwordResetInit';
import inviteUser from './inviteUser';

const eventsObj = {
  password_reset_init: passwordResetInit,
  invite_user: inviteUser,
};

export default eventsObj;
