const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  passwordHash: Joi.string().required(),
  phone: Joi.string().min(10).max(15).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  passwordHash: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
