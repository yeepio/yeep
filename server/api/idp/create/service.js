import { ObjectId } from 'mongodb';
import {
  OrgNotFoundError,
  IdentityProviderNotFound,
  InvalidIdentityProviderProtocol,
} from '../../../constants/errors';
import { OAUTH } from '../../../constants/idpProtocols';
import idps from '../../../idps';

export async function createIdentityProvider({ db }, { org, type, protocol, ...otherProps }) {
  const OAuthIdentityProviderModel = db.model('OAuthIdentityProvider');
  const OrgModel = db.model('Org');

  // acquire org from db
  const orgRecord = await OrgModel.findOne({
    _id: ObjectId(org),
  });

  // ensure org exists
  if (!orgRecord) {
    throw new OrgNotFoundError(`Org ${org} does not exist`);
  }

  // retrieve identity provider
  const idp = idps[type];

  // ensure idp exists
  if (!idp) {
    throw new IdentityProviderNotFound(`Identity provider "${idp.name}" not found`);
  }

  // ensure idp protocol matches the designated protocol
  if (idp.protocol !== protocol) {
    throw new InvalidIdentityProviderProtocol(
      `Identity provider "${idp.name}" does not support "${protocol}" protocol`
    );
  }

  // create identity provider
  let record;
  switch (protocol) {
    case OAUTH: {
      record = await OAuthIdentityProviderModel.create({
        type,
        protocol,
        org,
        ...otherProps,
      });
      break;
    }
    default: {
      throw new Error(`Unknown identity provider protocol "${protocol}"`);
    }
  }

  return {
    id: record._id.toHexString(),
    name: record.name,
    type: record.type,
    protocol: record.protocol,
    logo: idp.logo,
    org: org || null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export default createIdentityProvider;
