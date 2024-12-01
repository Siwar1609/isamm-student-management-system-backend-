import Joi from "joi";

const subjectValidator = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    "any.required": 'Le champ "title" est obligatoire.',
    "string.min": 'Le champ "title" doit avoir au moins 3 caractères.',
    "string.max": 'Le champ "title" doit avoir au maximum 100 caractères.',
  }),
  description: Joi.string().min(10).max(500).required().messages({
    "any.required": 'Le champ "description" est obligatoire.',
    "string.min": 'Le champ "description" doit avoir au moins 10 caractères.',
    "string.max": 'Le champ "description" doit avoir au maximum 500 caractères.',
  }),
  level: Joi.number().integer().min(1).max(5).required().messages({
    "any.required": 'Le champ "level" est obligatoire.',
    "number.min": 'Le champ "level" doit être un entier supérieur ou égal à 1.',
    "number.max": 'Le champ "level" doit être un entier inférieur ou égal à 5.',
  }),
  semester: Joi.number().integer().min(1).max(2).required().messages({
    "any.required": 'Le champ "semester" est obligatoire.',
    "number.min": 'Le champ "semester" doit être un entier supérieur ou égal à 1.',
    "number.max": 'Le champ "semester" doit être un entier inférieur ou égal à 2.',
  }),
  teacherId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base":
        'Le champ "teacherId" doit être un identifiant valide.',
    }),
  skillId: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      "array.items": 'Le champ "skillId" doit contenir des identifiants valides.',
    }),
  evaluation_matiereID: Joi.number().optional().messages({
    "number.base": 'Le champ "evaluation_matiereID" doit être un nombre valide.',
  }),
  published: Joi.boolean().optional().messages({
    "boolean.base": 'Le champ "published" doit être un booléen valide.',
  }),
  curriculumId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base":
        'Le champ "curriculumId" doit être un identifiant valide.',
    }),
  academicYearId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        'Le champ "academicYearId" doit être un identifiant valide.',
      "any.required": 'Le champ "academicYearId" est obligatoire.',
    }),
  chapId: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      "array.base": 'Le champ "chapId" doit être un tableau.',
      "array.items": 'Chaque élément du champ "chapId" doit être un identifiant valide.',
    }),
});

export default subjectValidator;
