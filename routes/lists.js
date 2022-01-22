import express from "express";
import { mongoClient } from "../index.js";
import { validateList } from "../validation.js";
import { ObjectId } from "mongodb";

const router = express.Router();
//Finds all lists belonging to the specified user

//http://localhost:5000/lists

router.get("/getlists/:username", async (req, res) => {
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
router.post("/createlist/:username", async (req, res) => {
	//Checks if the object is valid
	const validation = await validateList(req.body);

	//If there's an error with the validation, return error.
	if (validation.error) {
		return res.status(400).send(validation.error.details[0].message);
	}

	// //Checks if there already exists a list with the same name belonging to the same user.
	const listExists = await mongoClient
		.db("listify")
		.collection("shoppinglists")
		.findOne({
			username: req.body.username.toLowerCase(),
			title: req.body.title,
		});

	//If the list exists, return error
	if (listExists) {
		return res.status(400).send("You already have a list with that name");
	}

	//Create a new list
	await mongoClient.db("listify").collection("shoppinglists").insertOne({
		username: req.body.username.toLowerCase(),
		title: req.body.title,
		items: [],
	});
	res.send("Created a new list");
});

//Deletes a list
router.delete("/delete/:id", async (req, res) => {
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
export default router;
