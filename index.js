import express from "express";
import cors from "cors";

import usersRoutes from "./routes/users.js";
import listsRoutes from "./routes/lists.js";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors({ methods: ["GET", "POST", "DELETE"] }));

app.use("/users", usersRoutes);
app.use("/lists", listsRoutes);

app.get("/", (request, response) => response.send("Hello from Homepage"));

app.listen(PORT, () => {
	console.log(`Server Running on port: http://localhost:${PORT}`);
});
