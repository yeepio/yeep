const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('permissions').insertMany(
    [
      {
        _id: 'yeep.user.write',
        description: 'Permission to write (i.e. create, update, delete) users',
      },
      {
        _id: 'yeep.user.read',
        description: 'Permission to read users',
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
