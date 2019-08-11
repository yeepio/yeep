import { ObjectId } from 'mongodb';
import { RoleNotFoundError } from '../../../constants/errors';

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
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

async function getRoleInfo({ db }, { id }) {
  const RoleModel = db.model('Role');

  // retrieve role from db
  const roles = await RoleModel.aggregate([
    {
      $match: { _id: ObjectId(id) },
    },
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

  // make sure role exists
  if (roles.length === 0) {
    throw new RoleNotFoundError(`Role ${id} not found`);
  }

  return formatRole(roles[0]);
}

export default getRoleInfo;
