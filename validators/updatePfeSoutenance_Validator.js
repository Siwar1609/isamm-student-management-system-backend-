import Joi from 'joi';

const updateSoutenanceValidation = Joi.object({
  students: Joi.array()
    .items(Joi.string().hex().length(24)) 
    .optional(), 
  salleSoutenance: Joi.string().optional(), 
  dateSoutenance: Joi.date().optional(), 
  academicYear: Joi.string().optional(),
  projectId: Joi.string().hex().length(24).optional(), 
  teachers: Joi.array()
    .items(
      Joi.object({
        teacherId: Joi.string().hex().length(24).required(), 
        role: Joi.string()
          .valid('encadrant', 'rapporteur', 'président de jury')
          .required(),
      })
    )
    .optional(),
  send: Joi.boolean().optional(), 
  published: Joi.boolean().optional(),
  role:Joi.string().valid('encadrant', 'rapporteur', 'président de jury').optional(),
  idenseignant:Joi.string().hex().length(24).optional(),
});

export { updateSoutenanceValidation };
