import Joi from 'joi'

const validateChoicePFA = (data) => {
  const schema = Joi.object({
    projectId: Joi.number().integer().min(1).required().messages({
      'number.base': 'Le projectId doit être un nombre entier',
      'number.min': 'Le projectId doit être un nombre positif',
      'any.required': 'Le projectId est obligatoire',
    }),
    priority: Joi.number().integer().min(1).required().messages({
      'number.base': 'La priorité doit être un nombre entier',
      'number.min': 'La priorité doit être un nombre positif',
      'any.required': 'La priorité est obligatoire',
    }),
    etudiantsList: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)) // Validation ObjectId pour chaque étudiant
      .min(1)
      .required()
      .messages({
        'array.base': 'La liste des étudiants doit être un tableau',
        'array.min': 'La liste des étudiants ne peut pas être vide',
        'any.required': 'La liste des étudiants est obligatoire',
      }),
    approval: Joi.boolean().required().messages({
      'any.required': "L'approbation est obligatoire",
    }),
    validate: Joi.boolean().required().messages({
      'any.required': 'La validation est obligatoire',
    }),
  })

  return schema.validate(data)
}

export { validateChoicePFA }
