import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

//Middleware
export const verifyJWT = (req, res, next) => {
	//Checks if a token was provided.
	if (!req.headers.cookie)
		return res.status(401).send("No authentication token provided");

	//The cookie string starts with tokenname and equal sign "jwt=[STRING]", removes the "jwt="
	const token = req.headers.cookie.slice(4);
	Jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).send("The token is not valid"); //Forbidden
		}
		console.log("VerifyJWT successfully verified!");
		req.userID = decoded.username;
		next();
	});
};
