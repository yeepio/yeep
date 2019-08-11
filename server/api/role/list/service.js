import { ObjectId } from 'mongodb';
import has from 'lodash/has';
import escapeRegExp from 'lodash/escapeRegExp';

export const stringifyCursor = ({ id }) => {
  return Buffer.from(JSON.stringify(id)).toString('base64');
};

export const parseCursor = (cursorStr) => {
  const id = JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  return { id };
};

function getRoles({ db }, $match, limit) {
  return db.model('Role').aggregate([
    {
      $match,
    },
    {
      $limit: limit,
    },
    // {
    //   $lookup: {
    //     from: 'orgMemberships',
    //     let: { roleId: '$_id' },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $eq: ['$roles.id', '$$roleId'],
    //           },
    //         },
    //       },
    //       {
    //         $group: {
    //           _id: '$userId',
    //         },
    //       },
    //     ],
    //     as: 'users',
    //   },
    // },
    {
      $lookup: {
        from: 'orgs',
        localField: 'scope',
        foreignField: '_id',
        as: 'orgs',
      },
    },
    {
      $lookup: {
        from: 'permissions',
        localField: 'permissions',
        foreignField: '_id',
        as: 'permissions',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        isSystemRole: 1,
        'permissions._id': 1,
        'permissions.name': 1,
        'orgs._id': 1,
        'orgs.name': 1,
      },
    },
  ]);
}

function getRoleCount({ db }, $match) {
  return db.model('Role').countDocuments($match);
}

function formatRole(role) {
  return {
    id: role._id.toHexString(),
    name: role.name,
    org:
      role.orgs.length === 0
        ? null
        : {
            id: role.orgs[0]._id.toHexString(),
            name: role.orgs[0].name,
          },
    description: role.description,
    isSystemRole: role.isSystemRole,
    permissions: role.permissions.map((permission) => {
      return {
        id: permission._id.toHexString(),
        name: permission.name,
      };
    }),
    usersCount: 0,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

async function listRoles(ctx, { q, limit, cursor, scopes, isSystemRole }) {
  // decorate match expressions
  const matchExpressions = [];

  if (!scopes.includes(null)) {
    matchExpressions.push({
      scope: { $in: scopes.map((scope) => ObjectId(scope)) },
    });
  }

  if (q) {
    matchExpressions.push({
      name: {
        $regex: `^${escapeRegExp(q)}`,
        $options: 'i',
      },
    });
  }

  if (isSystemRole) {
    matchExpressions.push({
      isSystemRole: { $eq: isSystemRole },
    });
  }

  // get role count promise
  const getRoleCountPromise = getRoleCount(
    ctx,
    matchExpressions.length ? { $and: matchExpressions } : {}
  );

  // we don't want the cursor to be taken into account when counting
  if (cursor) {
    matchExpressions.push({
      _id: { $gt: ObjectId(cursor.id) },
    });
  }

  // get roles promise
  const getRolesPromise = getRoles(
    ctx,
    matchExpressions.length ? { $and: matchExpressions } : {},
    limit
  );

  // resolve both promises
  const [roles, roleCount] = await Promise.all([getRolesPromise, getRoleCountPromise]);

  return {
    roles: roles.map(formatRole),
    roleCount,
  };
}

export default listRoles;
