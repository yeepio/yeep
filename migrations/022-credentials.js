const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.createCollection('credentials', next);
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  mongoose.connection.db.dropCollection('credentials', next);
};
