import Joi from 'joi';

const baseSchema = {
  title: Joi.string()
    .min(3)
    .max(100)
    .messages({
      'string.base': 'Title should be a string',
      'string.empty': 'Title is required',
      'string.min': 'Title should have at least {#limit} characters',
      'string.max': 'Title should not exceed {#limit} characters'
    }),

  description: Joi.string()
    .min(10)
    .max(500)
    .messages({
      'string.base': 'Description should be a string',
      'string.empty': 'Description is required',
      'string.min': 'Description should have at least {#limit} characters',
      'string.max': 'Description should not exceed {#limit} characters'
    }),

  academicYearId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      'string.pattern.base': 'Academic year ID must be a valid ObjectId'
    }),

  chapId: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .messages({
      'array.base': 'Chapters should be an array of ObjectIds'
    })
};

// Validateur pour la création
export const createCurriculumValidator = Joi.object({
  ...baseSchema,
  title: baseSchema.title.required(),
  description: baseSchema.description.required(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Subject ID must be a valid ObjectId',
      'any.required': 'Subject ID is required'
    })
}).options({ abortEarly: false });

// Validateur pour les mises à jour
export const updateCurriculumValidator = Joi.object(baseSchema)
  .options({ 
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });