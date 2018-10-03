const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('orgMemberships').createIndex(
    {
      'permissions.id': 1,
      'permissions.resourceId': 1,
    },
    {
      name: 'permissionAssignment_idx',
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db
    .collection('orgMemberships')
    .dropIndex('permissionAssignment_idx', next);
};
