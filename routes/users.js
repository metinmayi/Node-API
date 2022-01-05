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

router.get("/", (request, response) => {
	(async function () {
		const result = await mongoClient
			.db("listify")
			.collection("users")
			.find()
			.toArray();
		response.send(result);
	})();
});

router.post("/", (request, response) => {
	console.log(request.body);
	response.send("You sent a POST request");
	mongoClient.db("listify").collection("users").insertOne(request.body);
});

export default router;
