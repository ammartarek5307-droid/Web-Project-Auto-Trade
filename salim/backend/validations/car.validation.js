const Joi = require('joi');

const createCarSchema = Joi.object({
  make: Joi.string().required(),
  model: Joi.string().required(),
  category: Joi.string().required(),
  subType: Joi.string().allow('', null),
  year: Joi.number().integer().min(1886).max(new Date().getFullYear() + 1).required(),
  mileage: Joi.number().min(0).required(),
  price: Joi.number().min(0).required(),
  transmission: Joi.string().allow('', null),
  fuel: Joi.string().allow('', null),
  color: Joi.string().allow('', null),
  engine: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  sellerName: Joi.string().allow('', null),
  sellerPhone: Joi.string().allow('', null),
  sellerId: Joi.string().allow('', null),
  image: Joi.any().optional(), // Handled by multer or string
  images: Joi.any().optional()
});

module.exports = {
  createCarSchema,
};
