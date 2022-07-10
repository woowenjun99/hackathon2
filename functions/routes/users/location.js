require("dotenv").config()
const functions = require("firebase-functions")
const {connect, connection, model} = require("mongoose")
const cors = require("cors")({origin: true})
const {locationSchema, userSchema} = require("../../mongoose/schema")

const User = new model("users", userSchema)
const Location = new model("location", locationSchema)

exports.location = functions.region("asia-southeast1").https.onRequest((req, res) => {
    cors(req, res, async () => {
        let result;
        if (!connection.readyState) {
            connect(process.env.DB_URL)
        }
        switch (req.method) {
            case "POST":
                try {
                    const {uid, longitude, lattitude} = req.body
                    const foundUser = await User.findOne({uid})
                    if (!foundUser) {
                        result = {status: 404, message: "User not found."}
                        break;
                    }
                    const location = new Location({
                        role: foundUser.role,
                        uid,
                        longitude,
                        lattitude
                    })
                    await location.save()
                    result = {status: 200, message: location}
                    break;
                } catch (e) {
                    result = {status: 500, message: e.message}
                    break;
                }
            case "GET":
                try {
                    const {uid} = req.query;
                    // If no firebase uid is provided, reject the query.
                    if (!uid) {
                        res.status(401).json({message: "Unauthorised. Please pass in the uid as a query"})
                        return
                    }
                    // Search for the user
                    const foundLocation = await Location.findOne({uid})
                    if (!foundLocation) {
                        res.status(400).json({message: "User has not uploaded his location."})
                    }

                    const query1 = {role: foundLocation.role === "patient" ? "caregiver" : "patient"}
                    const query2 = {longitude: {$range: [foundLocation.longitude - 0.01, foundLocation.longitude + 0.01]}}
                    const query3 = {lattitude: {$range: [foundLocation.lattitude - 0.01, foundLocation.lattitude + 0.01]}}

                    const nearBy = await Location.find({$and: [query1, query2, query3]})
                    if (!nearBy) {
                        res.status(404).json({message: "No user nearby"})
                    }
                    res.status(200).json({message: nearBy})
                } catch (e) {
                    res.status(500).json({message: e.message})
                }
            default:
                result = {status: 405, message: "Method not allowed"}
        }

        const {status, message} = result
        res.status(status).json(message)
    })
})