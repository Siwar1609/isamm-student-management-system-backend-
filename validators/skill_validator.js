import Joi from 'joi';
import mongoose from 'mongoose';

// Fonction pour valider les ObjectId
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
      "any.required": 'Le champ "name" est obligatoire.',
      "string.min": 'Le champ "name" doit avoir au moins 1 caractère.',
      "string.max": 'Le champ "name" doit avoir au maximum 100 caractères.',
    }),
  description: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      "any.required": 'Le champ "description" est obligatoire.',
      "string.min": 'Le champ "description" doit avoir au moins 10 caractères.',
      "string.max": 'Le champ "description" doit avoir au maximum 500 caractères.',
    }),
  subjectId: Joi.array()
    .items(Joi.string().custom(objectIdValidator, "ObjectId validation"))
    .optional()
    .messages({
      "any.invalid": 'Chaque élément dans "subjectId" doit être un ObjectId valide.',
    }),
  force: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": 'Le champ "force" doit être un booléen.',
    }),
});

export default skillValidator;
