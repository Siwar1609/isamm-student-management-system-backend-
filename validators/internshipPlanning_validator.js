import Joi from 'joi';
// Validation du schéma de la planification de stage
export const internshipPlanningValidator = Joi.object({
  date: Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/) // Format ISO strict : YYYY-MM-DD
  .optional()
  .messages({
    'string.pattern.base': 'La date doit être dans un format valide (YYYY-MM-DD).',
  }),

  horaire: Joi.string()
  .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i) // Format 12 heures avec AM/PM obligatoires
  .required()
  .messages({
    'string.pattern.base': 'Le format de l\'horaire doit être HH:mm AM ou HH:mm PM.',
    'any.required': 'Le champ horaire est obligatoire.',
  }),

  LienGoogleMeet: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Le lien Google Meet doit être une URL valide.',
    }),
});

