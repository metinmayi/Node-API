import express from "express";
import dotenv from "dotenv";

dotenv.config();

//MongoDB section
import { MongoClient, ObjectId } from "mongodb";
const mongoClient = new MongoClient(process.env.MONGODB_TOKEN);
mongoClient.connect(() => {
	console.log("Database is connected!");
});

//Finds all lists belonging to the username by username query.
const router = express.Router();
router.get("/user/:username", async (req, res) => {
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
router.delete("/id/:id", async (req, res) => {
	const id = new ObjectId(req.params.id);
	//Delete the list by id
	try {
		await mongoClient
			.db("listify")
			.collection("shoppinglists")
			.deleteOne({ _id: id });
		res.send("Deleted document with id: " + req.params.id);
	} catch (error) {
		res.send("There was an issue resolving your request.");
		console.log(error);
	}
});
//Creates a new list for a user.
router.post("/user/:username", async (req, res) => {
	//If the input is invalid.

	if (!req.body.username || !req.body.title) {
		res.end("Invalid post");
		return;
	}
	const newList = {
		username: req.body.username,
		title: req.body.title,
		items: [],
	};
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
