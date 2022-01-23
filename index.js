import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.js";
import listsRoutes from "./routes/lists.js";
import bcryptjs from "bcryptjs";
import Jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { verifyJWT } from "./middleware/verifyJWT.js";
import { validateLogin } from "./validation.js";
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
		maxAge: 1 * 60 * 1000,
		sameSite: "None",
		secure: true,
	});
	res.json("Login successful");
});

//Logout
app.get("/logout", async (req, res) => {
	res.cookie("jwt", "", {
		httpOnly: true,
		maxAge: 1,
		sameSite: "None",
		secure: true,
	});
	res.redirect("/");
	res.send("Logged you out");
});

//Routes
app.use(verifyJWT);
app.use("/users", usersRoutes);
app.use("/lists", listsRoutes);

//Checks if you're already logged in
app.get("/loginStatus", async (req, res) => {
	console.log(req.userID);
	if (req.userID) {
		res.send(req.userID);
	}
	res.status(404);
});
//Start server
app.listen(PORT, () => {
	console.log(`Server Running on port: http://localhost:${PORT}`);
});
