import Joi from 'joi'
import Teacher from '../models/users-models/teacher_model.js'

// Validateur des jours et salles
export const validatePFASoutenanceData = Joi.object({
  jours: Joi.array()
    .items(Joi.date().iso().required())
    .min(1)
    .required()
    .messages({
      'array.min': 'La liste des jours doit contenir au moins une date valide.',
      'date.iso': 'Chaque jour doit être une date valide au format ISO.',
    }),

  salles: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      'array.min':
        'La liste des salles doit contenir au moins une salle valide.',
      'string.empty': 'Chaque salle doit être une chaîne de caractères valide.',
    }),

  rapporteur: Joi.array()
    .items(Joi.string().regex(/^[a-f\d]{24}$/i)) // Validation des ObjectId
    .optional(),
})
.custom(async (value, helpers) => {
  try {
    // Vérification des rapporteurs
    if (value.rapporteur && value.rapporteur.length > 0) {
      for (const teacherId of value.rapporteur) {
        console.log('Vérification du rapporteur:', teacherId);

        // Rechercher l'enseignant dans la base de données
        const rapporteurExist = await Teacher.findById(teacherId);
        console.log('Résultat de la recherche:', rapporteurExist);

        // Si le rapporteur n'existe pas
        if (!rapporteurExist) {
          throw new Error(`L'enseignant avec l'ID ${teacherId} n'existe pas.`);
        }
      }
    }
    // Retourner les données validées si tout est correct
    return value;
  } catch (error) {
    return helpers.message(error.message)
  }
});

export default validatePFASoutenanceData
