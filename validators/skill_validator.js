import Joi from 'joi';

const skillValidator = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    "any.required": 'Le champ "name" est obligatoire.',
    "string.min": 'Le champ "name" doit avoir au moins 1 caractères.',
    "string.max": 'Le champ "name" doit avoir au maximum 100 caractères.',
  }),
  description: Joi.string().min(10).max(500).required().messages({
    "any.required": 'Le champ "description" est obligatoire.',
    "string.min": 'Le champ "description" doit avoir au moins 10 caractères.',
    "string.max": 'Le champ "description" doit avoir au maximum 500 caractères.',
  }),
});

export default skillValidator;
