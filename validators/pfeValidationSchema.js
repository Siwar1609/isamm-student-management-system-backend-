import Joi from 'joi'

export const pfeValidationSchema = Joi.object({
  company_name: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().valid('PFE').required(),
  teacherId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': "L'ID du professeur doit être un ObjectId valide.",
    }),
  studentId: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base':
            "Chaque ID d'étudiant doit être un ObjectId valide.",
        }),
    )
    .required(),
  WorkMode: Joi.string().valid('Binome', 'Monome').required(),
  affected: Joi.boolean().optional().default(false),
  published: Joi.boolean().optional().default(false),
  academicyear: Joi.string().optional(),
  documentId: Joi.array()
  .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
  .required()
  .messages({
    'array.base': 'Document ID must be an array.',
    'array.includes': 'Each Document ID must be a valid 24-character hex string.',
    'any.required': 'Document ID is required.',
  }),
})

