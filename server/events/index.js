import passwordResetInit from './passwordResetInit';
import inviteUser from './inviteUser';
import joinUser from './joinUser';

const eventsObj = {
  password_reset_init: passwordResetInit,
  invite_user: inviteUser,
  join_user: joinUser,
};

export default eventsObj;
