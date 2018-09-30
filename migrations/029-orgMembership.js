const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('orgMemberships').createIndex(
    {
      'roles.id': 1,
      'roles.resourceId': 1,
    },
    {
      name: 'roleAssignment_idx',
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('orgMemberships').dropIndex('roleAssignment_idx', next);
};
