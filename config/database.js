const mongoose = require("mongoose");
const connection = mongoose.createConnection(process.env.MONGODB_URL);

const cardSchema = new mongoose.Schema({
  cardno: String,
  profile: String,
  logo: String,
  theme: String,
  name: String,
  title: String,
  department: String,
  company: String,
  headline: String,
  details: String,
});

const userSchema = new mongoose.Schema({
  email: String,
  created: [String],
  shared: [String],
  saved: [String],
});

const NewCard = connection.model("Card", cardSchema);
const NewUser = connection.model("User", userSchema);

module.exports = connection;
