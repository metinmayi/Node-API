import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.js";
import listsRoutes from "./routes/lists.js";
import bcryptjs from "bcryptjs";
import Jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
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

//Routes
app.use("/users", usersRoutes);
app.use("/lists", listsRoutes);

//login
app.post("/", async (req, res) => {
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
		maxAge: 10 * 1000,
		sameSite: "None",
		secure: true,
	});
	res.json("Login successful");
});

//Start server
app.listen(PORT, () => {
	console.log(`Server Running on port: http://localhost:${PORT}`);
});
