import Mongoose from "mongoose";

const userSchema = new Mongoose.Schema({ name: String, password: String });

module.exports = Mongoose.model("users", userSchema);
