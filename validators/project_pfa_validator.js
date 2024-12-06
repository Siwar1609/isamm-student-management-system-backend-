import Joi from 'joi'

// Schéma Joi pour valider un PFA
const PFAValidator = Joi.object({
  title: Joi.string().min(20).required().messages({
    'string.empty': 'Le titre est obligatoire.',
    'string.min': 'Le titre doit comporter au moins 20 caractères.',
  }),

  description: Joi.string().required().messages({
    'string.empty': 'La description est obligatoire.',
  }),

  type: Joi.string().valid('PFA').default('PFA').messages({
    'any.only': 'Le type doit être "PFA".',
  }),

  technologies_list: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      'array.base': 'La liste des technologies doit être un tableau.',
      'array.min':
        'La liste des technologies doit contenir au moins une technologie.',
    }),

  binome: Joi.boolean().required().messages({
    'boolean.base': 'Le champ binome doit être un booléen.',
    'any.required': 'Indiquez si le projet est en binôme ou non.',
  }),

  list_of_student: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)) // Format ObjectId
    .required()
    .custom((value, helpers) => {
      const { binome } = helpers.state.ancestors[0] // Accède à la valeur de "binome"
      if (binome && value.length !== 2) {
        return helpers.message(
          'Le projet en binôme doit avoir exactement 2 étudiants.',
        )
      }
      if (!binome && value.length !== 1) {
        return helpers.message(
          'Le projet en monôme doit avoir exactement 1 étudiant.',
        )
      }
      return value
    }),

  teacher: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/) // Format ObjectId
    .required()
    .messages({
      'string.pattern.base': "L'ID de l'enseignant n'est pas valide.",
      'any.required': 'Un enseignant doit être assigné au projet.',
    }),

  affected: Joi.boolean().default(false).messages({
    'boolean.base': 'Le champ "affected" doit être un booléen.',
  }),

  published: Joi.boolean().default(false).messages({
    'boolean.base': 'Le champ "published" doit être un booléen.',
  }),

  rejected: Joi.boolean().default(false).messages({
    'boolean.base': 'Le champ "rejected" doit être un booléen.',
  }),


  academicyear: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/) // Format ObjectId
    .required()
    .messages({
      'string.pattern.base': "L'ID de l'année académique n'est pas valide.",
      'any.required': "L'année académique est obligatoire.",
    }),

  document: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)) // Format ObjectId
    .default([])
    .messages({
      'array.base': 'Le champ document doit être un tableau.',
      'string.pattern.base': "L'ID du document n'est pas valide.",
    }),
})

export default PFAValidator
