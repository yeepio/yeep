const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  const now = new Date();
  await mongoose.connection.db.collection('roles').insertOne(
    {
      name: 'admin',
      permissions: ['yeep.user.write', 'yeep.user.read'],
      createdAt: now,
      updatedAt: now,
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('roles').deleteOne(
    {
      name: 'admin',
    },
    next
  );
};
