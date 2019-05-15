import { ObjectId } from 'mongodb';
import memoizeOne from 'memoize-one';
import groupBy from 'lodash/groupBy';
import idps from '../../../idps';
import { OrgNotFoundError } from '../../../constants/errors';

const groupIdpsByType = memoizeOne((obj) => {
  return groupBy(Object.values(obj), 'type');
});

export async function getIdentityProviders({ db }, { org, limit, cursor }) {
  const IdentityProviderModel = db.model('IdentityProvider');
  const OrgModel = db.model('Org');

  const query = {};

  if (org) {
    // acquire org from db
    const orgRecord = await OrgModel.findOne({
      _id: ObjectId(org),
    });

    // ensure org exists
    if (!orgRecord) {
      throw new OrgNotFoundError(`Org ${org} does not exist`);
    }

    // decorate query with org
    query.org = ObjectId(org);
  }

  if (cursor) {
    query._id = {
      $gt: ObjectId(cursor.id),
    };
  }

  const idpObj = groupIdpsByType(idps);
  const records = await IdentityProviderModel.find(query, null, { limit });

  return records.map((e) => {
    const idp = idpObj[e.type];

    return {
      id: e._id.toHexString(),
      name: e.name,
      type: e.type,
      org: {
        id: e.org ? e.org.toHexString() : null,
      },
      protocol: idp.protocol,
      logo: idp.logo,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  });
}
