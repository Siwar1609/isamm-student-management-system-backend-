import Joi from 'joi'

// Définir le schéma Joi
const periodValidator = Joi.object({
  name: Joi.string()
    .valid(
      'Dépôt des Sujet des PFA',
      'Choix sujet PFA',
      'Dépôt de stage',
      'Dépot PFE',
      'Choix d’option',
    )
    .required()
    .messages({
      'any.required': 'Le champ "name" est obligatoire.',
      'string.valid': 'Le champ "name" doit correspondre à une période valide.',
    }),

  start_date: Joi.date().required().messages({
    'any.required': 'Le champ "start_date" est obligatoire.',
    'date.base': 'Le champ "start_date" doit être une date valide.',
  }),

  end_date: Joi.date()
    .required()
    .greater(Joi.ref('start_date')) // end_date doit être après start_date
    .messages({
      'any.required': 'Le champ "end_date" est obligatoire.',
      'date.base': 'Le champ "end_date" doit être une date valide.',
      'date.greater':
        'La date de fin doit être postérieure à la date de début.',
    }),
  
})

export default periodValidator
