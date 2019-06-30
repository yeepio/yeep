import { ObjectId } from 'mongodb';

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

async function listPendingInvitations({ db }, { orgId, userId, limit, cursor }) {
  const InvitationTokenModel = db.model('InvitationToken');

  const query = {};
  if (orgId) {
    query.org = ObjectId(orgId);
  }
  if (userId) {
    query.user = ObjectId(userId);
  }
  if (cursor) {
    query._id = {
      $gt: ObjectId(cursor.id),
    };
  }

  const invitationRecords = await InvitationTokenModel.find(query, null, { limit });

  return invitationRecords.map((e) => {
    return {
      id: e._id.toHexString(),
      token: e.secret,
      org: {
        id: e.org ? e.org.toHexString() : null,
      },
      user: {
        id: e.user ? e.user.toHexString() : null,
        emailAddress: e.invitee.emailAddress,
      },
      roles: e.invitee.roles,
      permissions: e.invitee.permissions,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      expiresAt: e.expiresAt,
    };
  });
}

export default listPendingInvitations;
