import Joi from 'joi';
// Validation du schéma de la planification de stage
export const internshipPlanningValidator = Joi.object({
  
  meeting: Joi.object({
    date: Joi.date()
      .optional()
      .messages({
        'date.base': 'La date de la réunion doit être une date valide.',
      }),
    
    time: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) // Format horaire valide HH:mm
      .optional()
      .messages({
        'string.pattern.base': 'Le format de l\'horaire doit être HH:mm.',
      }),
    
    googleMeetLink: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Le lien Google Meet doit être une URL valide.',
      }),
  }).optional(),

  sentEmail: Joi.boolean()
    .default(false)
    .optional(),

  sentAt: Joi.date()
    .optional()
    .allow(null),
});

