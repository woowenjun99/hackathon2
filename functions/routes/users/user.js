const functions = require("firebase-functions");
const cors = require("cors")({origin: true});
const {connect, connection, model} = require("mongoose");
const {userSchema} = require("../../mongoose/schema");

const User = new model("users", userSchema);

exports.user = functions.region("asia-southeast1").https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (!connection.readyState) {
      connect(process.env.DB_URL, {dbName: "test"});
    }

    if (req.method === "POST") {
      try {
        const {firstName, lastName, email, meetLocation, phone, uid, address} = req.body;
        if (!uid) {
          res.status(401).json({message: "Unauthorized. Please provide a uid in the body."})
        }
        const user = new User({
          firstName,
          lastName,
          email,
          meetLocation,
          phone,
          uid,
          role,
          address
        });

        await user.save();

        res.status(201).json({message: user});
      } catch (e) {
        res.status(500).json({message: e.message});
      }
    } else if (req.method === "GET") {
      const {uid} = req.query;
      if (!req.query || !uid) {
        res.status(401).json({message: "Unauthorized"});
      }

      const foundUser = await User.findOne({uid});
      if (!foundUser) {
        res.status(404).json({message: "No such user found."});
      }
      res.status(200).json({message: foundUser});
    }
    res.status(405).json({message: "Method not allowed"});
  });
});
