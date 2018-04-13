const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
  return new User({}).save();   // Empty User instance is saved becaue Google ID and displayNAme from Google
};
