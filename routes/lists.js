import express from "express";
import dotenv from "dotenv";
dotenv.config();

//MongoDB section
import { MongoClient } from "mongodb";
const mongoClient = new MongoClient(process.env.MONGODB_TOKEN);
mongoClient.connect(() => {
	console.log("Database is connected!");
});

//Finds all lists belonging to the username by username query.
const router = express.Router();
router.get("/:username", async (req, res) => {
	const username = req.params.username;
	try {
		const userLists = await mongoClient
			.db("listify")
			.collection("shoppinglists")
			.find({ username: username })
			.toArray();
		res.send(userLists);
	} catch (error) {
		res.send("There was an issue resolving your request");
		console.log(error);
	}
});
//Creates a new list for a user.
router.post("/:username", async (req, res) => {
	//If the input is invalid.

	if (!req.body.username || !req.body.title) {
		res.end("Invalid post");
		return;
	}
	const newList = { username: req.body.username, title: req.body.title };
	try {
		await mongoClient
			.db("listify")
			.collection("shoppinglists")
			.insertOne(newList);

		res.end("Added a new list");
	} catch (error) {
		res.end("There was an issue resolving your request");
		console.log(error);
	}
});

export default router;
