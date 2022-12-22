require("dotenv").config();
const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;

const connection = require("../config/database");

const NewUser = connection.models.User;
const NewCard = connection.models.Card;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// *
// * *
// post Routes

router.post("/newuser", (req, res) => {
  let error;
  NewUser.find({ email: req.fields.email }, (err, docs) => {
    error = err;
    if (!docs.length) {
      const newUser = new NewUser({
        email: req.fields.email,
        created: [],
        shared: [],
        saved: [],
      });
      try {
        newUser.save();
        res.send({
          email: req.fields.email,
          created: [],
          shared: [],
          saved: [],
        });
      } catch (err) {
        error = err;
      }
    } else {
      if (error) res.send({ error: error });
      else res.send(docs[0]);
    }
  });
});

//-----------------------------------------***-----------------------

router.post("/create", async (req, res) => {
  const profileImage = req.files["image"];
  const logoImage = req.files["logo"];
  let profileUrl = "";
  let logoUrl = "";
  let newUUID = uuidv4();
  let error;

  await cloudinary.uploader.upload(profileImage.path, (err, result) => {
    profileUrl = result.secure_url;
    error = err;
  });

  if (logoImage)
    await cloudinary.uploader.upload(logoImage.path, (err, result) => {
      logoUrl = result.secure_url;
      error = err;
    });

  const newCard = new NewCard({
    cardno: newUUID,
    profile: profileUrl,
    logo: logoUrl,
    theme: req.fields.theme,
    name: req.fields.name,
    title: req.fields.title,
    department: req.fields.department,
    company: req.fields.company,
    headline: req.fields.headline,
    details: req.fields.details,
  });
  try {
    newCard.save();
    await NewUser.findOneAndUpdate(
      { email: req.fields.email },
      { $push: { created: newUUID } }
    );
  } catch (e) {
    error = e;
  }
  if (error) {
    res.send({ status: error });
  } else res.send({ status: "OK" });
});

//-----------------------------------------***-----------------------

router.post("/savecard", async (req, res) => {
  let error;
  try {
    await NewUser.findOneAndUpdate(
      { email: req.fields.email },
      { $addToSet: { shared: req.fields.card } }
    );
  } catch (e) {
    error = e;
  }
  if (error) {
    res.send({ status: error });
  } else res.send({ status: "OK" });
});

// *
// * *
// get Routes

router.get("/card/:cardNo", (req, res) => {
  NewCard.findOne({ cardno: req.params.cardNo }, (err, doc) => {
    if (!err) res.send({ cardDetail: doc });
    else res.send({ error: err });
  });
});

router.get("/viewcard/:cardNo", (req, res) => {
  NewCard.findOne({ cardno: req.params.cardNo }, (err, doc) => {
    if (!err) res.render("card", { profile: doc });
    else res.send({ error: err });
  });
});

module.exports = router;
