import { ObjectId } from 'mongodb';
import escapeRegExp from 'lodash/escapeRegExp';

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

async function listUsers(db, { q, limit, cursor, scopes }) {
  const UserModel = db.model('User');

  // retrieve users
  const users = await UserModel.aggregate([
    {
      $match: Object.assign(
        scopes.includes(null)
          ? {}
          : {
              orgs: { $in: scopes.map((scope) => ObjectId(scope)) },
            },
        q
          ? {
              username: {
                $regex: `^${escapeRegExp(q)}`,
                $options: 'i',
              },
            }
          : {},
        cursor
          ? {
              _id: {
                $gt: ObjectId(cursor.id),
              },
            }
          : {}
      ),
    },
    // {
    //   $lookup: {
    //     from: 'roleAssignments',
    //     let: { userId: '$_id' },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $eq: ['$user', '$$userId'],
    //           },
    //         },
    //       },
    //       // {
    //       //   $group: {
    //       //     _id: '$role',
    //       //   },
    //       // },
    //     ],
    //     as: 'roleAssignments',
    //   },
    // },
    {
      $limit: limit,
    },
  ]);

  return users.map((user) => ({
    id: user._id.toHexString(),
    username: user.username,
    fullName: user.fullName,
    picture: user.picture,
    emails: user.emails,
    orgs: user.orgs.map((oid) => oid.toHexString()),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}

export default listUsers;
