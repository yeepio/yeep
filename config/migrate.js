require('dotenv').config(); // load environmental variables

module.exports = {
  [process.env.NODE_ENV]: process.env.MONGODB_URI,
};
