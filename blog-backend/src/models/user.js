const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { Schema } = mongoose;

const UserSChema = new Schema({
  username: String,
  hashedPassword: String,
});

UserSChema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

UserSChema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result;
};

UserSChema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      _id: this.id,
      username: this.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return token;
};

UserSChema.methods.serialize = function () {
  const data = this.toJSON();
  delete data["hashedPassword"];
  return data;
};

UserSChema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

const User = mongoose.model("User", UserSChema);
module.exports = User;
