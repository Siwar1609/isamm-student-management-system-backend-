import Joi from 'joi';

// Validation pour POST /PFE/open - PATCH /PFE/open -
export const validatePFEPeriod = (data) => {
  const schema = Joi.object({
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
  });

  return schema.validate(data);
};
