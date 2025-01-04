import Joi from 'joi'

const curriculumValidator = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'any.required': '"title" is required.',
    'string.min': '"title" length must be between 3 and 100.',
    'string.max': '"title" length must be between 3 and 100.',
  }),

  description: Joi.string().min(10).max(500).required().messages({
    'any.required': '"description" is required.',
    'string.min': '"description" length must be between 10 and 500.',
    'string.max': '"description" length must be between 10 and 500.',
  }),

  // subjectId should be a single ObjectId, not an array
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': '"subjectId" must be a valid ObjectId.',
      'any.required': '"subjectId" is required.',
    }),
  academicYearId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'array.items': '"academicYearId" must contain valid ObjectIds.',
      'any.required': '"academicYearId" is required.',
    }),
  // chapId should be an array of ObjectIds
  chapId: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'array.items': '"chapId" must contain valid ObjectIds.',
    }),
})

export default curriculumValidator
