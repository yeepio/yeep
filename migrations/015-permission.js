const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  const now = new Date();
  await mongoose.connection.db.collection('permissions').updateMany(
    {
      _id: {
        $in: ['yeep.user.write', 'yeep.user.read'],
      },
    },
    {
      $set: {
        isSystemPermission: true,
        updatedAt: now,
      },
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('permissions').updateMany(
    {
      _id: {
        $in: ['yeep.user.write', 'yeep.user.read'],
      },
    },
    {
      $unset: {
        isSystemPermission: '',
      },
    },
    next
  );
};
