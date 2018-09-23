import { ObjectId } from 'mongodb';
import escapeRegExp from 'lodash/escapeRegExp';
import pick from 'lodash/pick';

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

export const defaultProjection = {
  id: true,
  username: true,
  fullName: true,
  picture: true,
  emails: true,
  orgs: true,
  createdAt: true,
  updatedAt: true,
};

async function listUsers(db, { q, limit, cursor, scopes, projection }) {
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

  const fields = Object.entries(projection).reduce((accumulator, [key, value]) => {
    if (value) {
      return accumulator.concat(key);
    }
    return accumulator;
  }, []);

  // Please note: if you add a new prop to user, remember to update the defaultProjection obj
  return users.map((user) =>
    pick(
      {
        id: user._id.toHexString(),
        username: user.username,
        fullName: user.fullName,
        picture: user.picture,
        emails: user.emails,
        orgs: user.orgs.map((oid) => oid.toHexString()),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      fields
    )
  );
}

export default listUsers;
