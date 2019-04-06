import OrgSchema from './Org';
import UserSchema from './User';
import AuthFactorSchema from './AuthFactor';
import TokenSchema from './Token';
import OrgMembershipSchema from './OrgMembership';
import PermissionSchema from './Permission';
import RoleSchema from './Role';
import PasswordSchema from './AuthFactor-Password';
import TOTPSchema from './AuthFactor-TOTP';

export const registerModels = (db) => {
  db.model('Org', OrgSchema);
  db.model('User', UserSchema);
  db.model('Permission', PermissionSchema);
  db.model('Role', RoleSchema);
  db.model('OrgMembership', OrgMembershipSchema);
  db.model('Token', TokenSchema);
  db.model('AuthFactor', AuthFactorSchema);
  db.model('AuthFactor').discriminator('Password', PasswordSchema, 'PASSWORD'); // 3rd param declares the "type" value
  db.model('AuthFactor').discriminator('TOTP', TOTPSchema, 'TOTP');
};
