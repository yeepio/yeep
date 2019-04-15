import orgSchema from './Org';
import userSchema from './User';
import authFactorSchema from './AuthFactor';
import tokenSchema from './Token';
import orgMembershipSchema from './OrgMembership';
import permissionSchema from './Permission';
import roleSchema from './Role';
import passwordSchema from './AuthFactor-Password';
import totpSchema from './AuthFactor-TOTP';

export const registerModels = (db) => {
  db.model('Org', orgSchema);
  db.model('User', userSchema);
  db.model('Permission', permissionSchema);
  db.model('Role', roleSchema);
  db.model('OrgMembership', orgMembershipSchema);
  db.model('Token', tokenSchema);
  db.model('AuthFactor', authFactorSchema);
  db.model('AuthFactor').discriminator('Password', passwordSchema, 'PASSWORD'); // 3rd param declares the "type" value
  db.model('AuthFactor').discriminator('TOTP', totpSchema, 'TOTP');
};
