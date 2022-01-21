import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.js";
import listsRoutes from "./routes/lists.js";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT;

//Creates a MongoDB client and connects it.
export const mongoClient = new MongoClient(process.env.MONGODB_TOKEN);
mongoClient.connect(() => {
	console.log("Database is connected!");
});

//Routes
app.use("/users", usersRoutes);
app.use("/lists", listsRoutes);

app.get("/", (request, response) => response.send("Hello from Homepage"));

//Server Settings
app.use(express.json());
app.use(cors({ methods: ["GET", "POST", "DELETE"] }));
//Start server
app.listen(PORT, () => {
	console.log(`Server Running on port: http://localhost:${PORT}`);
});
