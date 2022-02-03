import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.js";
import listsRoutes from "./routes/lists.js";
import itemsRoutes from "./routes/items.js";
import bcryptjs from "bcryptjs";
import Jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { verifyJWT } from "./middleware/verifyJWT.js";
import {
	validateLogin,
	validateRegistration,
} from "./validation/validation.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT;

//Server Settings
app.use(express.json());
app.use(
	cors({
		origin: (origin, callback) => callback(null, true),
		credentials: true,
	})
);

//Creates a MongoDB client and connects it.
export const mongoClient = new MongoClient(process.env.MONGODB_TOKEN);
mongoClient.connect(() => {
	console.log("Database is connected!");
});

//Login
app.post("/login", async (req, res) => {
	console.log("Login request");
	//Validates the login object
	const validation = validateLogin(req.body);
	if (validation.error) {
		return res.status(400).send(validation.error.details[0].message);
	}

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
	res.cookie("jwt", token, {
		httpOnly: true,
		maxAge: 60 * 60 * 15 * 1000,
		sameSite: "None",
		secure: true,
	});
	res.json("Login successful");
});

//Logout
app.get("/logout", async (req, res) => {
	console.log("Logout request");
	res
		.cookie("jwt", "", {
			httpOnly: true,
			maxAge: 1,
			sameSite: "None",
			secure: true,
		})
		.redirect("/");
});

//Registers a user
app.post("/register", async (req, res) => {
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

//Routes
app.use(verifyJWT);
app.use("/users", usersRoutes);
app.use("/lists", listsRoutes);
app.use("/items", itemsRoutes);

//Checks if you're already logged in
app.get("/loginStatus", async (req, res) => {
	// console.log(req.userID);
	if (req.userID) {
		res.send(req.userID);
	}
	res.status(404);
});
//Start server
app.listen(PORT, () => {
	console.log(`Server Running on port: http://localhost:${PORT}`);
});
