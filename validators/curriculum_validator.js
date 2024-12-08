import Joi from 'joi';

const curriculumValidator = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "any.required": 'Le champ "name" est obligatoire.',
    "string.min": 'Le champ "name" doit avoir au moins 3 caractères.',
    "string.max": 'Le champ "name" doit avoir au maximum 100 caractères.',
  }),
  objectif: Joi.string().min(10).max(500).required().messages({
    "any.required": 'Le champ "objectif" est obligatoire.',
    "string.min": 'Le champ "objectif" doit avoir au moins 10 caractères.',
    "string.max": 'Le champ "objectif" doit avoir au maximum 500 caractères.',
  }),
  description: Joi.string().min(10).max(500).required().messages({
    "any.required": 'Le champ "description" est obligatoire.',
    "string.min": 'Le champ "description" doit avoir au moins 10 caractères.',
    "string.max": 'Le champ "description" doit avoir au maximum 500 caractères.',
  }),
  subjectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
    "string.pattern.base": 'Le champ "subjectId" doit être un identifiant valide.',
  }),
  chapId: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      "array.items": 'Le champ "chapId" doit contenir des identifiants valides.',
    }),
  academicYearId: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .required()
    .messages({
      "array.items": 'Le champ "academicYearId" doit contenir des identifiants valides.',
      "any.required": 'Le champ "academicYearId" est obligatoire.',
    }),
  modification: Joi.array().items(
    Joi.object({
      proposition: Joi.string().required(),
      reason: Joi.string().required(),
      enregistrer: Joi.boolean().default(false),
      modification_date: Joi.date().default(Date.now),
    })
  ),
});

export default curriculumValidator;
