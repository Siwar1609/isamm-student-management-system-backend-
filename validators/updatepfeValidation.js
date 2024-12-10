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
  workMode: Joi.string()
    .valid('Binome', 'Monome')
    .optional()
    .allow(null),
  affected: Joi.boolean().optional(),
  academicYear: Joi.string().optional().allow(null),
  documentId: Joi.array()
    .items(Joi.string())
    .optional()
    .allow(null), 
  periodId: Joi.string().optional().allow(null),
}).custom((value, helpers) => {
  // Validation logic for numberOfStudents and studentId
  if (value.numberOfStudents === 'Binome' && value.studentId && value.studentId.length !== 2) {
    return helpers.message('Pour un binôme, il faut exactement 2 étudiants.');
  }
  if (value.numberOfStudents === 'Monome' && value.studentId && value.studentId.length !== 1) {
    return helpers.message('Pour un monome, il faut exactement 1 étudiant.');
  }
  return value;
});

export { updatePFEValidation };
