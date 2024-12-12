import Joi from 'joi'

const chapterValidator = Joi.object({
  order: Joi.number().integer().positive().required().messages({
    'any.required': '"order" is required.',
    'number.base': '"order" must be an integer.',
    'number.positive': '"order" must be a positive integer.',
  }),
  title: Joi.string().min(3).max(100).required().messages({
    'any.required': '"title" is required.',
    'string.min': '"title" must have at least 3 characters.',
    'string.max': '"title" must have at most 100 characters.',
  }),
  section: Joi.array()
    .items(
      Joi.object({
        content: Joi.string().max(500).messages({
          'string.max': '"content" must have at most 500 characters.',
        }),
        advancement: Joi.string()
          .valid('not yet', 'in progress', 'completed')
          .default('not yet')
          .messages({
            'any.only':
              '"advancement" must be "not yet", "in progress", or "completed".',
          }),
      }),
    )
    .optional()
    .messages({
      'array.base': '"section" must be an array.',
    }),
  subjectId: Joi.string().required().messages({
    'any.required': '"subjectId" is required.',
    'string.base': '"subjectId" must be a valid string.',
  }),
})

export default chapterValidator
