import Joi from "joi";

//Validates the new user registration object.
export const validateRegistration = async (object) => {
	const schema = Joi.object({
		username: Joi.string().min(6).required(),
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
