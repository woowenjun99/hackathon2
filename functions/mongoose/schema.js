const {Schema} = require("mongoose");

exports.userSchema = new Schema({
  firstName: String,
  lastName: String,
  meetLocation: String,
  email: String,
  uid: String,
  phone: String,
  role: String,
  address: String,
});

exports.locationSchema = new Schema({
  uid: String,
  lattitude: Number,
  longitude: Number,
  role: String
})