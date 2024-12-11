import Joi from 'joi';

// Définir le schéma Joi pour Internship
const internshipValidator = Joi.object({
  periodeOuverte: Joi.boolean()
    .required()
    .messages({
      'any.required': 'Le champ "periodeOuverte" est obligatoire.',
      'boolean.base': 'Le champ "periodeOuverte" doit être un booléen.',
    }),

  startDate: Joi.date()
    .required()
    .messages({
      'any.required': 'Le champ "startDate" est obligatoire.',
      'date.base': 'Le champ "startDate" doit être une date valide.',
    }),

  endDate: Joi.date()
    .required()
    .greater(Joi.ref('startDate')) // endDate doit être après startDate
    .messages({
      'any.required': 'Le champ "endDate" est obligatoire.',
      'date.base': 'Le champ "endDate" doit être une date valide.',
      'date.greater': 'La date de fin doit être postérieure à la date de début.',
    }),

  academicYear: Joi.string()
    .required()
    .messages({
      'any.required': 'Le champ "academicYear" est obligatoire.',
      'string.base': 'Le champ "academicYear" doit être une chaîne de caractères valide.',
    }),

  level: Joi.number()
    .valid(1, 2)
    .required()
    .messages({
      'any.required': 'Le champ "level" est obligatoire.',
      'number.base': 'Le champ "level" doit être un nombre.',
      'any.only': 'Le champ "level" doit être égal à 1 ou 2.',
    }),

  published: Joi.boolean()
    .required()
    .messages({
      'any.required': 'Le champ "published" est obligatoire.',
      'boolean.base': 'Le champ "published" doit être un booléen.',
    }),

  Validate: Joi.object({
    value: Joi.boolean()
      .required()
      .messages({
        'any.required': 'Le champ "value" est obligatoire dans "Validate".',
        'boolean.base': 'Le champ "value" dans "Validate" doit être un booléen.',
      }),

    reason: Joi.string().optional().messages({
      'string.base': 'Le champ "reason" doit être une chaîne de caractères.',
    }),
  }).required(),

});

export default internshipValidator;
