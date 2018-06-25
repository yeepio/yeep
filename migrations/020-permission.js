const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  const now = new Date();
  await mongoose.connection.db.collection('permissions').insertMany(
    [
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
    ],
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('permissions').deleteMany(
    {
      scope: { $exists: false },
      name: {
        $in: ['yeep.permission.write', 'yeep.permission.read'],
      },
    },
    next
  );
};
