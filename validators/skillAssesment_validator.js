import Joi from 'joi';

const skillAssessmentValidator = Joi.object({
  studentId: Joi.number().required().messages({
    'any.required': 'Student ID is required.',
    'number.base': 'Student ID must be a number.',
  }),
  eval: Joi.array().items(
    Joi.object({
      skill: Joi.string().required().messages({
        'any.required': 'Skill is required.',
        'string.base': 'Skill must be a valid string.',
      }),
      grade: Joi.number().min(0).max(5).required().messages({
        'any.required': 'Grade is required.',
        'number.base': 'Grade must be a number.',
        'number.min': 'Grade must be between 0 and 5.',
        'number.max': 'Grade must be between 0 and 5.',
      }),
    })
  ).required().messages({
    'any.required': 'Evaluation data is required.',
    'array.base': 'Evaluation must be an array of skill assessments.',
  }),
  academicYearId: Joi.string().required().messages({
    'any.required': 'Academic Year ID is required.',
    'string.base': 'Academic Year ID must be a valid string.',
  }),
});

export default skillAssessmentValidator;
