import Joi from 'joi';

const curriculumValidator = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "any.required": '"name" is required.',
    "string.min": '"name" length must be between 3 and 100.',
    "string.max": '"name" length must be between 3 and 100.',
  }),
  objectif: Joi.string().min(10).max(500).required().messages({
    "any.required": '"objectif" is required.',
    "string.min": '"objectif" length must be between 10 and 500.',
    "string.max": '"objectif" length must be between 10 and 500.',
  }),
  description: Joi.string().min(10).max(500).required().messages({
    "any.required": '"description" is required.',
    "string.min": '"description" length must be between 10 and 500.',
    "string.max": '"description" length must be between 10 and 500.',
  }),
  
  // subjectId should be a single ObjectId, not an array
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": '"subjectId" must be a valid ObjectId.',
      "any.required": '"subjectId" is required.',
    }),

  // chapId should be an array of ObjectIds
  chapId: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      "array.items": '"chapId" must contain valid ObjectIds.',
    }),

  // academicYearId should be an array of ObjectIds
  academicYearId: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .required()
    .messages({
      "array.items": '"academicYearId" must contain valid ObjectIds.',
      "any.required": '"academicYearId" is required.',
    }),

  // teacherId should be a valid ObjectId
  teacherId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": '"teacherId" must be a valid ObjectId.',
    }),

  // modification is an array of modification objects
  modification: Joi.array().items(
    Joi.object({
      proposition: Joi.string().required(),
      reason: Joi.string().required(),
      enregistrer: Joi.boolean().default(false),
      modification_date: Joi.date().default(Date.now),
    })
  ).optional(),
});

export default curriculumValidator;

