const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  const now = new Date();
  const permissions = await mongoose.connection.db
    .collection('permissions')
    .find(
      {
        name: { $regex: /^yeep\./ },
      },
      {
        projection: {
          _id: 1,
        },
      }
    )
    .toArray();
  await mongoose.connection.db.collection('roles').insertOne(
    {
      name: 'admin',
      isSystemRole: true,
      permissions: permissions.map((e) => e._id),
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
