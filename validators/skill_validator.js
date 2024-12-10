import Joi from 'joi';
import mongoose from 'mongoose';

// Function to validate ObjectId
const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const skillValidator = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      "any.required": '"name" is required.',
      "string.min": '"name" must be at least 1 character long.',
      "string.max": '"name" must not exceed 100 characters.',
    }),

  description: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      "any.required": '"description" is required.',
      "string.min": '"description" must be at least 10 characters long.',
      "string.max": '"description" must not exceed 500 characters.',
    }),
   
    skillAssesmentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
      'any.required': 'skill assesment ID is optional.',
      'string.pattern.base': 'skill assesment ID must be a valid MongoDB ObjectId.',
    }), // MongoDB ObjectId pattern for academic year ID
    

  subjectId: Joi.array()
    .items(Joi.string().custom(objectIdValidator, "ObjectId validation"))
    .optional()
    .messages({
      "any.invalid": 'Each element in "subjectId" must be a valid ObjectId.',
    }),

  force: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": '"force" must be a Boolean.',
    }),
});

export default skillValidator;
