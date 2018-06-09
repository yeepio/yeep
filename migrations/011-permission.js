const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  const now = new Date();
  await mongoose.connection.db.collection('permissions').insertMany(
    [
      {
        _id: 'yeep.user.write',
        description: 'Permission to write (i.e. create, update, delete) users',
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: 'yeep.user.read',
        description: 'Permission to read users',
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
      _id: {
        $in: ['yeep.user.write', 'yeep.user.read'],
      },
    },
    next
  );
};
