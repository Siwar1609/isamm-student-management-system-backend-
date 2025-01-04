import Joi from 'joi'
import Student from '../models/users-models/student_model.js'
import Teacher from '../models/users-models/teacher_model.js'

export const pfaValidationSchema = Joi.object({
  title: Joi.string().min(20).required().messages({
    'string.empty': 'Le titre est obligatoire.',
    'string.min': 'Le titre doit comporter au moins 20 caractères.',
  }),

  description: Joi.string().required().messages({
    'string.empty': 'La description est obligatoire.',
  }),

  type: Joi.string().valid('PFA').messages({
    'any.only': 'Le type doit être "PFA".',
  }),

  technologies_list: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      'array.base': 'La liste des technologies doit être un tableau.',
      'array.min':
        'La liste des technologies doit contenir au moins une technologie.',
    }),

  teacherId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': "L'ID du professeur doit être un ObjectId valide.",
    }),
  numberOfStudents: Joi.string().valid('Binome', 'Monome').default('Monome'),

  list_of_student: Joi.array().items(
    Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .allow(null, '')
      .messages({
        'string.pattern.base':
          "Chaque ID d'étudiant doit être un ObjectId valide.",
      }),
  ),

  affected: Joi.boolean().default(false).messages({
    'boolean.base': 'Le champ "affected" doit être un booléen.',
  }),

  published: Joi.boolean().default(false).messages({
    'boolean.base': 'Le champ "published" doit être un booléen.',
  }),

  rejected: Joi.boolean().default(false).messages({
    'boolean.base': 'Le champ "rejected" doit être un booléen.',
  }),

  academicYear: Joi.string().messages({
    'string.empty': "L'année académique est obligatoire.",
  }),

  documentId: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .default([])
    .messages({
      'array.base': 'Le champ document doit être un tableau.',
      'string.pattern.base': "L'ID du document n'est pas valide.",
    }),

  periodId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': "L'ID de la période n'est pas valide.",
    }),
})
  .custom(async (value, helpers) => {
    // Vérification de l'existence de studentId avant itération
    if (value.studentId && value.studentId.length > 0) {
      // Validation des étudiants
      for (const studentId of value.studentId) {
        const studentExists = await Student.findById(studentId)
        if (!studentExists) {
          return helpers.message(
            `L'ID ${studentId} n'existe pas ou n'est pas un étudiant valide.`,
          )
        }
      }
    }

    // Validation de l'enseignant
    const teacherExists = await Teacher.findById(value.teacherId)
    if (!teacherExists) {
      return helpers.message(
        "L'enseignant spécifié n'existe pas ou n'est pas valide.",
      )
    }

    // Validation pour Binome ou Monome
    if (value.numberOfStudents === 'Binome' && value.studentId.length !== 2) {
      return helpers.message('Pour un binôme, il faut exactement 2 étudiants.')
    }
    if (value.numberOfStudents === 'Monome' && value.studentId.length !== 1) {
      return helpers.message('Pour un monome, il faut exactement 1 étudiant.')
    }

    return value
  })
  .messages({
    'object.base': 'Les données fournies doivent être un objet.',
  })

export default pfaValidationSchema
