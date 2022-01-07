import express from "express";
import cors from "cors";

import usersRoutes from "./routes/users.js";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors({ methods: ["GET", "POST"] }));

app.use("/users", usersRoutes);

app.get("/", (request, response) => response.send("Hello from Homepage"));

app.listen(PORT, () => {
	console.log(`Server Running on port: http://localhost:${PORT}`);
});
