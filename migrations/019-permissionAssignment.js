const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('permissionAssignments').createIndex(
    { user: 1, org: 1, permission: 1, resource: 1 },
    {
      unique: true,
      name: 'assignment_uidx',
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db
    .collection('permissionAssignments')
    .dropIndex('assignment_uidx', next);
};
