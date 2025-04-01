import Joi from 'joi';

const curriculumValidator = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Le titre est requis',
      'string.min': 'Le titre doit contenir au moins {#limit} caractères',
      'string.max': 'Le titre ne peut excéder {#limit} caractères',
      'any.required': 'Le titre est requis'
    }),

  description: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'La description est requise',
      'string.min': 'La description doit contenir au moins {#limit} caractères',
      'string.max': 'La description ne peut excéder {#limit} caractères',
      'any.required': 'La description est requise'
    }),

  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'L\'ID de matière doit être un ObjectId valide',
      'string.empty': 'L\'ID de matière est requis',
      'any.required': 'L\'ID de matière est requis'
    }),

  academicYearId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()  // Rendu optionnel
    .allow(null) // Permet explicitement null
    .messages({
      'string.pattern.base': 'L\'ID d\'année académique doit être un ObjectId valide'
    }),

  chapId: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message('Chaque ID de chapitre doit être un ObjectId valide')
    )
    .optional()
    .messages({
      'array.base': 'Les chapitres doivent être fournis sous forme de tableau'
    })
}).options({
  abortEarly: false, // Retourne toutes les erreurs, pas juste la première
  allowUnknown: false // Rejette les champs non déclarés
});

export default curriculumValidator;