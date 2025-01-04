import Joi from "joi";

const subjectValidator = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    "any.required": '"title" is required.',
    "string.min": '"title" must have at least 3 characters.',
    "string.max": '"title" must have at most 100 characters.',
  }),
  description: Joi.string().min(10).max(500).required().messages({
    "any.required": '"description" is required.',
    "string.min": '"description" must have at least 10 characters.',
    "string.max": '"description" must have at most 500 characters.',
  }),
  level: Joi.number().integer().min(1).max(5).required().messages({
    "any.required": '"level" is required.',
    "number.min": '"level" must be an integer greater than or equal to 1.',
    "number.max": '"level" must be an integer less than or equal to 5.',
  }),
  semester: Joi.number().integer().min(1).max(2).required().messages({
    "any.required": '"semester" is required.',
    "number.min": '"semester" must be an integer greater than or equal to 1.',
    "number.max": '"semester" must be an integer less than or equal to 2.',
  }),

  skillId: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      "array.items": '"skillId" must contain valid ObjectIds.',
    }),
  published: Joi.boolean().optional().messages({
    "boolean.base": '"published" must be a valid boolean.',
  }),
  curriculumId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": '"curriculumId" must be a valid ObjectId.',
    }),
  teacherId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
     
      "array.items": 'Each element in "teacherId" must be a valid ObjectId.',
    }),
  academicYearId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": '"academicYearId" must be a valid ObjectId.',
      "any.required": '"academicYearId" is required.',
    }),
  chapId: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      "array.base": '"chapId" must be an array.',
      "array.items": 'Each element in "chapId" must be a valid ObjectId.',
    }),
  studentId: Joi.array() 
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      "array.base": '"studentId" must be an array.',
      "array.items": 'Each element in "studentId" must be a valid ObjectId.',
    }),
});


export default subjectValidator;