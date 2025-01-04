import Joi from 'joi'
import Student from '../models/users-models/student_model.js'

const validateChoicePFA = Joi.object({
  priority: Joi.number().required().messages({
    'number.base': 'La priorité doit être un nombre.',
    'any.required': 'La priorité est obligatoire.',
  }),
  binomeId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null, '') // Permet de rendre `binomeId` optionnel
    .messages({
      'string.pattern.base': "L'ID du binôme doit être un ObjectId valide.",
    }),
  approval: Joi.boolean().default(false).messages({
    'boolean.base': "L'approbation doit être une valeur booléenne.",
  }),
})
  .custom(async (value, helpers) => {
    // Vérification si un binomeId a été fourni
    if (value.binomeId) {
      const binomeExists = await Student.findById(value.binomeId)
      if (!binomeExists) {
        return helpers.message(
          "Le binôme spécifié n'existe pas ou n'est pas valide.",
        )
      }
      if (binomeExists.level !== "2") {
        return helpers.message('Le binôme doit avoir le niveau 2.')
      }
    }
    return value
  })
  .messages({
    'object.base': 'Les données fournies doivent être un objet.',
  })

export default validateChoicePFA
