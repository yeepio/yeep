const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  const now = new Date();
  await mongoose.connection.db.collection('permissions').insertMany(
    [
      {
        name: 'yeep.org.write',
        description: 'Permission to write (i.e. update, delete) orgs',
        isSystemPermission: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'yeep.org.read',
        description: 'Permission to read orgs',
        isSystemPermission: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'yeep.user.write',
        description: 'Permission to write (i.e. create, update, delete) users',
        isSystemPermission: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'yeep.user.read',
        description: 'Permission to read users',
        isSystemPermission: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'yeep.permission.write',
        description: 'Permission to write (i.e. create, update, delete) permissions',
        isSystemPermission: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'yeep.permission.read',
        description: 'Permission to read permissions',
        isSystemPermission: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'yeep.permission.assignment.write',
        description: 'Permission to write (i.e. create, update, delete) permission assignments',
        isSystemPermission: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'yeep.permission.assignment.read',
        description: 'Permission to read permission assignments',
        isSystemPermission: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'yeep.role.write',
        description: 'Permission to write (i.e. create, update, delete) roles',
        isSystemPermission: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'yeep.role.read',
        description: 'Permission to read roles',
        isSystemPermission: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'yeep.role.assignment.write',
        description: 'Permission to write (i.e. create, update, delete) role assignments',
        isSystemPermission: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'yeep.role.assignment.read',
        description: 'Permission to read role assignments',
        isSystemPermission: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('permissions').deleteMany(
    {
      name: {
        $in: [
          'yeep.org.write',
          'yeep.org.read',
          'yeep.user.write',
          'yeep.user.read',
          'yeep.permission.write',
          'yeep.permission.read',
          'yeep.permission.assignment.write',
          'yeep.permission.assignment.read',
          'yeep.role.write',
          'yeep.role.read',
          'yeep.role.assignment.write',
          'yeep.role.assignment.read',
        ],
      },
    },
    next
  );
};
