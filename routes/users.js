import express from "express";
import { validateRegistration } from "../validation.js";
import { mongoClient } from "../index.js";
const router = express.Router();

//Returns a list of all users
router.get("/", async (request, response) => {
	try {
		const result = await mongoClient
			.db("listify")
			.collection("users")
			.find()
			.toArray();
		response.send(result);

		console.log(request.params);
	} catch (error) {
		response.send(error);
	}
});
//Returns a specific user
router.get("/:username", async (request, response) => {
	try {
		console.log(request.params.username);
		const result = await mongoClient
			.db("listify")
			.collection("users")
			.findOne({ username: request.params.username });
		response.send(result);
	} catch (error) {
		response.send(request.params + "Failed");
	}
});
//Creates a new user
router.post("/", async (request, response) => {
	//Checks if the new user object is valid
	const validation = await validateRegistration(request.body);
	//If there's an error with the validation
	if (validation.error) {
		response.send(validation.error.details[0].message);
		return;
	}
	//If there's no error. Create a user and send it to the database
	const newUsername = request.body.username.toLowerCase();
	const newUser = {
		username: newUsername,
		password: request.body.password,
	};
	response.send("Created a new user");
	await mongoClient.db("listify").collection("users").insertOne(newUser);
	return;
});

export default router;
