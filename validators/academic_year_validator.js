// validators/academic_year_validator.js
import Joi from 'joi';

const academicYearValidator = Joi.object({
  start_year: Joi.date().required().messages({
    "any.required": '"start_year" is required.',
    "date.base": '"start_year" must be a valid date.',
  }),
  end_year: Joi.date().required().greater(Joi.ref('start_year')).messages({
    "any.required": '"end_year" is required.',
    "date.base": '"end_year" must be a valid date.',
    "date.greater": '"end_year" must be after "start_year".',
  }),
  status: Joi.string().valid('pending', 'off').default('pending').messages({
    "any.only": '"status" must be either "pending" or "off".',
  }),
  current: Joi.boolean().required().messages({
    "any.required": '"current" is required.',
    "boolean.base": '"current" must be a boolean value.',
  }),
});

export default academicYearValidator;
