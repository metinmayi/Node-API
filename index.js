import express from "express";

import usersRoutes from "./routes/users.js";

const app = express();
const PORT = 5000;

app.use(express.json());

app.use("/users", usersRoutes);

app.get("/", (request, response) => response.send("Hello from Homepage"));

app.listen(PORT, () => {
	console.log(`Server Running on port: http://localhost:${PORT}`);
});
