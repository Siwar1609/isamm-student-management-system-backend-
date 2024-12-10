import Joi from 'joi';

// Define the validation schema
const subjectAssessmentValidator = Joi.object({
  studentId: Joi.number().required().messages({
    'any.required': 'Student ID is required.',
    'number.base': 'Student ID must be a number.',
  }), // Student ID (ensure the correct type, number or string)
  
  subjectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'any.required': 'Subject ID is required.',
    'string.pattern.base': 'Subject ID must be a valid MongoDB ObjectId.',
  }), 
  
  grade: Joi.number().min(0).max(20).required().messages({
    'any.required': 'Grade is required.',
    'number.base': 'Grade must be a number.',
    'number.min': 'Grade must be between 0 and 20.',
    'number.max': 'Grade must be between 0 and 20.',
  }), // Grade between 0 and 5
  
  academicYearId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'any.required': 'Academic Year ID is required.',
    'string.pattern.base': 'Academic Year ID must be a valid MongoDB ObjectId.',
  }), // MongoDB ObjectId pattern for academic year ID
  studentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'any.required': 'student ID is required.',
    'string.pattern.base': 'student ID must be a valid MongoDB ObjectId.',
  }), // MongoDB ObjectId pattern for academic year ID
  
});

export default subjectAssessmentValidator;
