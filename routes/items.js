import express, { response } from "express";
import { mongoClient } from "../index.js";
import { validateItem } from "../validation/validation.js";
import { ObjectId } from "mongodb";
import cors from "cors";

const router = express.Router();
router.use(
	cors({
		origin: (origin, callback) => callback(null, true),
		credentials: true,
	})
);

//http://localhost:5000/items

//Add a new item to the list(id)
router.patch("/add/:id", async (req, res) => {
	//Validates the body
	const isError = await validateItem(req.body);
	if (isError.error) return res.status(400).send("Invalid payload");
	try {
		//Check if the list already has an item with that name.
		//Fetches the existing list by ID.
		const id = new ObjectId(req.params.id);
		const list = await mongoClient
			.db("listify")
			.collection("shoppinglists")
			.findOne({ _id: id });
		//Loops through the existing lists and checks for matching items.
		let matches = false;
		list.items.forEach((item) => {
			if (item.name === req.body.name) matches = true;
		});
		//If a match was found, return this.
		if (matches)
			return res.status(400).send("An item with that name already exists!");

		await mongoClient
			.db("listify")
			.collection("shoppinglists")
			.updateOne({ _id: id }, { $push: { items: req.body } });
		res.send("Updated document with id: " + req.params.id);
	} catch (error) {
		res.send(error);
	}
});

//Marks an item as complete (Changes it's boolean)
//This is a budget solution, trying to find a better way.
router.patch("/update/:id/:name", async (req, res) => {
	//Validation. If creating new ObjectId fails, throw an error
	let id;
	try {
		id = new ObjectId(req.params.id);
	} catch (error) {
		console.log(error);
		return res.send("Invalid ID");
	}
	//Fetches the list, checks for the item in the list and finds its boolean value.
	try {
		let booleanValue;
		const foundItem = await mongoClient
			.db("listify")
			.collection("shoppinglists")
			.findOne({ _id: id, "items.name": req.params.name });
		foundItem.items.forEach((item) => {
			if (item.name === req.params.name) booleanValue = item.bought;
		});

		await mongoClient
			.db("listify")
			.collection("shoppinglists")
			.updateOne(
				{ _id: id, "items.name": req.params.name },
				{ $set: { "items.$.bought": !booleanValue } }
			);
		res.send(`Toggled boolean from: ${booleanValue} to ${!booleanValue}`);
	} catch (error) {
		res.send(error);
	}
});

//Gets all items in the list(id)
router.get("/get/:id", async (req, res) => {
	//Validation. If creating new ObjectId fails, throw an error
	let id;
	try {
		id = new ObjectId(req.params.id);
	} catch (error) {
		console.log(error);
		return res.send("Invalid ID");
	}

	try {
		//Returns the list. If no list matches, sends an error
		const list = await mongoClient
			.db("listify")
			.collection("shoppinglists")
			.findOne({ _id: id });
		if (!list) res.send("Couldn't find a list with that ID");
		res.send(list.items);
	} catch (error) {
		res.send(error);
	}
});

//Deletes an item in the list(id)
router.delete("/delete/:id/:name", async (req, res) => {
	//Validation. If creating new ObjectId fails, throw an error
	let id;
	try {
		id = new ObjectId(req.params.id);
	} catch (error) {
		console.log(error);
		return res.send("Invalid ID");
	}
	//Delete the item
	try {
		await mongoClient
			.db("listify")
			.collection("shoppinglists")
			.updateOne({ _id: id }, { $pull: { items: { name: req.params.name } } });
		res.send(req.params);
	} catch (error) {
		res.send(error);
		console.log(error);
	}
});
export default router;
