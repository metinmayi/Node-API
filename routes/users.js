import express from "express";
import { validateRegistration } from "../validation.js";
import { mongoClient } from "../index.js";
import Jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
const router = express.Router();
// import cors from "cors";
// router.use(cors({ credentials: true }));

//http://localhost:5000/users

//Returns a list of all users
router.get("/", async (req, res) => {
	try {
		const result = await mongoClient
			.db("listify")
			.collection("users")
			.find()
			.toArray();
		res.send(result);

		console.log(req.params);
	} catch (error) {
		res.send(error);
	}
});

//Returns a specific user
router.get("/getuser/:username", async (req, res) => {
	try {
		console.log(req.params.username);
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

//Login a new user
router.post("/login", async (req, res) => {
	//Checks if that user exists
	const user = await mongoClient
		.db("listify")
		.collection("users")
		.findOne({ username: req.body.username.toLowerCase() });
	if (!user) {
		return res.status(400).send("That username is not registered.");
	}

	//Checks if the password is correct.
	const validPassword = await bcryptjs.compare(
		req.body.password,
		user.password
	);
	//If password is incorrect
	if (!validPassword) {
		return res.status(400).send("The password did not match the username");
	}

	//Create and assign a JSON web token
	const token = Jwt.sign(
		{ username: req.body.username.toLowerCase() },
		process.env.TOKEN_SECRET,
		{ expiresIn: "1d" }
	);
	res.cookie("jwt", token, { httpOnly: true, maxAge: 10 * 1000 });
	res.json("Login successful");
});

export default router;
