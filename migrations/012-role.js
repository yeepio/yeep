const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.createCollection('roles', next);
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  mongoose.connection.db.dropCollection('roles', next);
};
