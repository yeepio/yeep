const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('orgs').createIndex(
    { slug: 1 },
    {
      unique: true,
      name: 'slug_uidx',
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('orgs').dropIndex('slug_uidx', next);
};
