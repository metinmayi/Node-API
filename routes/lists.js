import express from "express";
import { mongoClient } from "../index.js";
import { ObjectId } from "mongodb";
const router = express.Router();
//Finds all lists belonging to the specified user
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
//Deletes the user with the specified ID
router.delete("/id/:id", async (req, res) => {
	//Turn the ID into an ObjectId, to make sure it works towards MongoDB.
	const id = new ObjectId(req.params.id);
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
