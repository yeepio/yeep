import { ObjectId } from 'mongodb';
import { PermissionNotFoundError } from '../../../constants/errors';

function formatPermission(permission) {
  return {
    id: permission._id.toHexString(),
    name: permission.name,
    description: permission.description,
    isSystemPermission: permission.isSystemPermission,
    org:
      permission.orgs.length === 0
        ? null
        : {
            id: permission.orgs[0]._id.toHexString(),
            name: permission.orgs[0].name,
          },
    roles: permission.roles.map((role) => {
      return {
        id: role._id.toHexString(),
        name: role.name,
      };
    }),
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
  };
}

async function getPermissionInfo({ db }, { id }) {
  const PermissionModel = db.model('Permission');

  // retrieve permission from db
  const permissions = await PermissionModel.aggregate([
    {
      $match: { _id: ObjectId(id) },
    },
    {
      $lookup: {
        from: 'roles',
        let: { e: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$$e', '$permissions'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
        ],
        as: 'roles',
      },
    },
    {
      $lookup: {
        from: 'orgs',
        let: { e: '$scope' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$e'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
            },
          },
        ],
        as: 'orgs',
      },
    },
  ]);

  // make sure permission exists
  if (permissions.length === 0) {
    throw new PermissionNotFoundError(`Permission ${id} not found`);
  }

  return formatPermission(permissions[0]);
}

export default getPermissionInfo;
