import express from "express";
import dotenv from "dotenv";
dotenv.config();

//MongoDB section
import { MongoClient } from "mongodb";
const mongoClient = new MongoClient(process.env.MONGODB_TOKEN);
mongoClient.connect(() => {
	console.log("Database is connected!");
});

const router = express.Router();

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
router.post("/", (request, response) => {
	console.log(request.body);
	if (request.body.username && request.body.password) {
		const newUsername = request.body.username.toLowerCase();
		const newUser = {
			username: newUsername,
			password: request.body.password,
		};
		console.log(request.body);
		response.send(newUser);
		mongoClient.db("listify").collection("users").insertOne(newUser);
		return;
	}
	response.send("You aint give me shit");
});

export default router;
