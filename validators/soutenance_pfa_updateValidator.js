import Joi from 'joi'

// Définir le schéma de validation
const soutenancePFAUpdateValidator = Joi.object({
  date: Joi.date()
    .min('now') // La date doit être dans le futur
    .messages({
      'date.base': 'La date doit être une valeur valide.',
      'date.min': 'La date doit être dans le futur.',
      'any.required': 'La date est obligatoire.',
    }),
  time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/) // Valide le format HH:mm
    .messages({
      'string.pattern.base': "L'heure doit être au format HH:mm.",
      'any.required': "L'heure est obligatoire.",
    }),
  room: Joi.string().messages({
    'string.base': 'La salle doit être une chaîne de caractères.',
    'any.required': 'La salle est obligatoire.',
  }),
  encadrant: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/) // Valide un ObjectId
    .messages({
      'string.pattern.base':
        "L'ID de l'encadrant doit être un ObjectId valide.",
    }),
  rapporteur: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/) // Valide un ObjectId
    .messages({
      'string.pattern.base': "L'ID du rapporteur doit être un ObjectId valide.",
    }),
})

export default soutenancePFAUpdateValidator
