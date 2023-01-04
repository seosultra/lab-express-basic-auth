// User model goes here
const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true, //
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      // regex check for invalid email | checked with regex test plugin
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
      unique: true,
      trim: true
    },
    hashedPassword: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const User = model('User', userSchema);

module.exports = User;
