const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('tokens').createIndex(
    { secret: 'hashed' },
    {
      name: 'secret_idx',
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('tokens').dropIndex('secret_idx', next);
};
