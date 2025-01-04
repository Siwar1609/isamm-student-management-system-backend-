import Joi from 'joi';

const updatePFEValidation = Joi.object({
  company_name: Joi.string().optional(),
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  type: Joi.string().valid('PFE').optional(), 
  teacherId: Joi.string().optional().allow(null), 
  studentId: Joi.array()
    .items(Joi.string())
    .optional()
    .allow(null), 
  WorkMode: Joi.string()
    .valid('Binome', 'Monome')
    .optional()
    .allow(null),
  affected: Joi.boolean().optional(),
  published:Joi.boolean().optional(),
  send:Joi.boolean().optional(),
  academicYear: Joi.string().optional().allow(null),
  documentId: Joi.array()
    .items(Joi.string())
    .optional()
    .allow(null), 
  periodId: Joi.string().optional().allow(null),
});

export { updatePFEValidation };
