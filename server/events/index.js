import passwordResetInit from './passwordResetInit';
import emailVerificationInit from './emailVerificationInit';
import inviteUser from './inviteUser';
import joinUser from './joinUser';

const eventsObj = {
  email_verification_init: emailVerificationInit,
  password_reset_init: passwordResetInit,
  invite_user: inviteUser,
  join_user: joinUser,
};

export default eventsObj;
