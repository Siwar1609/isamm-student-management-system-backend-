import Joi from 'joi'

// Schéma Joi pour valider un utilisateur

const userValidator = Joi.object({
  email: Joi.string().email().required().min(6).max(50).messages({
    'string.min': "L'email doit comporter au moins 6 caractères.",
    'string.max': "L'email doit comporter au plus 50 caractères.",
  }),
  cin: Joi.string().min(8).required().messages({
    'string.min': 'Le CIN doit comporter au moins 8 caractères.',
    'string.empty': 'Le CIN est obligatoire.',
  }),
  firstName: Joi.string().min(2).required().messages({
    'string.min': 'Le prénom doit comporter au moins 2 caractères.',
    'string.empty': 'Le prénom est obligatoire.',
  }),

  lastName: Joi.string().min(2).required().messages({
    'string.min': 'Le nom doit comporter au moins 2 caractères.',
    'string.empty': 'Le nom est obligatoire.',
  }),
  birthDate: Joi.date().required().messages({
    'date.base': 'La date de naissance doit être une date.',
    'date.empty': 'La date de naissance est obligatoire.',
  }),
  role: Joi.string()
    .valid('student', 'teacher', 'admin', 'user', 'professional_supervisor')
    .required()
    .messages({
      'any.only': 'Le rôle doit être dans la liste des rôles autorisés.',
    }),
  password: Joi.string().min(8),
  phone: Joi.string().required().messages({
    'string.empty': 'Le numéro de téléphone est obligatoire.',
  }),
  // we will add the missing student fileds as not required
  cv: Joi.string().allow(''),
  academicYearlevel: Joi.string().allow(''),
  level: Joi.string().allow(''),
  status: Joi.string().allow(''),
  // we will add the missing teacher fileds as not required
})

export default userValidator
