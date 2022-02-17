import Joi from "joi";

//Validates the new user registration object.
export const validateRegistration = async (object) => {
	const schema = Joi.object({
		username: Joi.string().alphanum().min(3).max(10),
		password: Joi.string().required(),
	});

	return schema.validate(object);
};

export const validateList = async (object) => {
	const schema = Joi.object({
		username: Joi.string().required(),
		title: Joi.string().required(),
	});

	return schema.validate(object);
};

export const validateLogin = async (object) => {
	const schema = Joi.object({
		username: Joi.string().required(),
		password: Joi.string().required(),
	});

	return schema.validate(object);
};

export const validateItem = async (object) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		bought: Joi.boolean().required(),
	});

	return schema.validate(object);
};
