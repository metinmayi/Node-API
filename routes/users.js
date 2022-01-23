import express from "express";
// import { validateRegistration } from "../validation.js";
import { mongoClient } from "../index.js";
// import Jwt from "jsonwebtoken";
// import bcryptjs from "bcryptjs";
const router = express.Router();
import cors from "cors";
router.use(
	cors({
		origin: (origin, callback) => callback(null, true),
		credentials: true,
	})
);

//http://localhost:5000/users

//Returns a list of all users
router.get("/", async (req, res) => {
	console.log(req.userID);
	try {
		const result = await mongoClient
			.db("listify")
			.collection("users")
			.find()
			.toArray();
		res.send(result);
	} catch (error) {
		res.send(error);
	}
});

//Returns a specific user
router.get("/getuser/:username", async (req, res) => {
	try {
		const result = await mongoClient
			.db("listify")
			.collection("users")
			.findOne({ username: req.params.username });
		res.send(result);
	} catch (error) {
		res.send(req.params + "Failed");
	}
});

export default router;
