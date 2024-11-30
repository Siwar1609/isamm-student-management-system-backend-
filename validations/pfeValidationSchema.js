import Joi from 'joi';

import { Teacher, Student } from './models'; 

export const pfeValidationSchema = Joi.object({
  company_name: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().valid('PFE').required(),
  teacherId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': "L'ID du professeur doit être un ObjectId valide.",
    }),
  studentId: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': "Chaque ID d'étudiant doit être un ObjectId valide.",
        })
    )
    .required(),
  numberOfStudents: Joi.string().valid('Binome', 'Monome').required(),
  affected: Joi.boolean().optional(),
  academicYear: Joi.string().required(),
  documentId: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).required(),
  periodId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
})
  .custom(async (value, helpers) => {
    // Validation pour les étudiants (discriminator Student)
    for (const studentId of value.studentId) {
      const studentExists = await Student.findById(studentId);
      if (!studentExists) {
        return helpers.message(`L'ID ${studentId} n'existe pas ou n'est pas un étudiant valide.`);
      }
    }

    // Validation pour l'enseignant (discriminator Teacher)
    const teacherExists = await Teacher.findById(value.teacherId);
    if (!teacherExists) {
      return helpers.message("L'enseignant spécifié n'existe pas ou n'est pas valide.");
    }

    // Validation pour Binome ou Monome
    if (value.numberOfStudents === 'Binome' && value.studentId.length !== 2) {
      return helpers.message('Pour un binôme, il faut exactement 2 étudiants.');
    }
    if (value.numberOfStudents === 'Monome' && value.studentId.length !== 1) {
      return helpers.message('Pour un monome, il faut exactement 1 étudiant.');
    }

    return value;
  })
  .messages({
    'object.base': 'Les données fournies doivent être un objet.',
  });
