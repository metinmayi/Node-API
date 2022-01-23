import express from "express";
import { validateRegistration } from "../validation.js";
import { mongoClient } from "../index.js";
import Jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
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

//Registers a user
router.post("/register", async (req, res) => {
	//Checks if the new user object is valid
	const validation = await validateRegistration(req.body);

	//If there's an error with the validation, return error.
	if (validation.error) {
		return res.status(400).send(validation.error.details[0].message);
	}

	//Checks if that username already exists in our database.
	const userExists = await mongoClient
		.db("listify")
		.collection("users")
		.findOne({ username: req.body.username.toLowerCase() });
	if (userExists) {
		return res.status(400).send("That username already exists.");
	}

	//Hash the password
	const salt = await bcryptjs.genSalt();
	const hashedPassword = await bcryptjs.hash(req.body.password, salt);

	//If there's no error. Create a user and send it to the database
	const newUsername = req.body.username.toLowerCase();
	const newUser = {
		username: newUsername,
		password: hashedPassword,
	};
	await mongoClient.db("listify").collection("users").insertOne(newUser);
	res.send("Created a new user");
});

export default router;
