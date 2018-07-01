const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('permissions').createIndex(
    { scope: 1, name: 1 },
    {
      unique: true,
      name: 'permission_uidx',
      collation: { locale: 'en', strength: 2 },
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('permissions').dropIndex('permission_uidx', next);
};
