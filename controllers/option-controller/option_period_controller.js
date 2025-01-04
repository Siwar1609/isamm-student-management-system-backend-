import Period from '../../models/period-model/period_model.js'
import periodValidator from '../../validators/period_validator.js'

export const openOptionPeriod = async (req, res) => {
  const { start_date, end_date } = req.body

  // Valider les données avec Joi
  const { error } = periodValidator.validate(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }

  try {
    // Vérifier si une période "Choix d’option" est déjà ouverte
    const existingPeriod = await Period.findOne({
      name: 'Choix d’option',
      start_date: { $lte: new Date() },
      end_date: { $gte: new Date() },
    })

    if (existingPeriod) {
      return res.status(400).json({
        message: 'Une période de choix d’option est déjà ouverte.',
      })
    }

    // Créer une nouvelle période pour le choix d’option
    const newPeriod = new Period({
      name: 'Choix d’option',
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    })

    await newPeriod.save()

    return res.status(201).json({
      message: 'La période de choix d’option a été ouverte avec succès.',
      period: newPeriod,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de l'ouverture de la période.",
      error: error.message,
    })
  }
}

export const getOptionPeriod = async (req, res) => {
  try {
    // Rechercher la période "Choix d’option"
    const optionPeriod = await Period.findOne({ name: 'Choix d’option' })

    if (!optionPeriod) {
      return res.status(404).json({
        message: "Aucune période de choix d'option n'est actuellement ouverte.",
      })
    }

    // Retourner les informations de la période "Choix d’option"
    return res.status(200).json({
      message:
        'Informations sur la période de choix d’option récupérées avec succès.',
      period: optionPeriod,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur lors de la récupération des informations de la période.',
      error: error.message,
    })
  }
}

export const updateOptionPeriod = async (req, res) => {
  const { start_date, end_date } = req.body

  // Valider les données avec Joi
  const { error } = periodValidator.validate(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }

  try {
    // Rechercher la période "Choix d'option"
    const optionPeriod = await Period.findOne({ name: 'Choix d’option' })

    if (!optionPeriod) {
      return res.status(404).json({
        message: "Aucune période de choix d'option n'est actuellement ouverte.",
      })
    }
    // Vérifier que start_date est avant end_date
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        message: 'La date de début doit être antérieure à la date de fin.',
      })
    }

    // Modifier les dates de la période "Choix d'option"
    optionPeriod.start_date = new Date(start_date)
    optionPeriod.end_date = new Date(end_date)

    // Sauvegarder les modifications
    await optionPeriod.save()

    return res.status(200).json({
      message:
        'Les délais de la période de choix d’option ont été modifiés avec succès.',
      period: optionPeriod,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur lors de la modification des délais de la période.',
      error: error.message,
    })
  }
}
