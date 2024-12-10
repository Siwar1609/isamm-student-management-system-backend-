import Period from '../../models/period-model/period_model.js'

export const openInternshipPeriod = async (req, res) => {
  const { start_date, end_date, type } = req.body

  // Vérifier si la date de fin est après la date de début
  if (new Date(start_date) >= new Date(end_date)) {
    return res.status(400).json({
      message: 'La date de début doit être inférieure à la date de fin.',
    })
  }

  // Vérifier si le type est valide
  if (![1, 2, 3].includes(type)) {
    return res.status(400).json({
      message: 'Le type de la période doit être 1, 2, ou 3.',
    })
  }

  try {
    // Vérifier si une période de type "Dépôt de stage" est déjà ouverte
    const existingPeriod = await Period.findOne({
      name: 'Dépôt de stage',
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    })

    if (existingPeriod) {
      return res.status(400).json({
        message:
          'Une période de dépôt de stage avec les mêmes dates est déjà ouverte.',
      })
    }

    // Créer une nouvelle période pour le dépôt de stage
    const newPeriod = new Period({
      name: 'Dépôt de stage',
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      type: type, // Add the type field
    })

    await newPeriod.save()
    return res.status(201).json({
      message: 'La période de dépôt de stage a été ouverte avec succès.',
      period: newPeriod,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de l'ouverture de la période.",
      error: error.message,
    })
  }
}

export const getInternshipPeriod = async (req, res) => {
  try {
    // Rechercher une période active de type "Dépôt de stage"
    const depotStagePeriod = await Period.findOne({ name: 'Dépôt de stage' })

    if (!depotStagePeriod) {
      return res.status(404).json({
        message: "Aucune période de dépôt de stage n'est actuellement ouverte.",
      })
    }

    return res.status(200).json({
      message:
        'Informations sur la période de dépôt de stage récupérées avec succès.',
      period: depotStagePeriod,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur lors de la récupération des informations de la période.',
      error: error.message,
    })
  }
}

// Méthode pour modifier les délais d'une période de dépôt de stage
export const updateInternshipPeriod = async (req, res) => {
  const { start_date, end_date, type } = req.body

  // Vérifier si la date de fin est après la date de début
  if (new Date(start_date) >= new Date(end_date)) {
    return res.status(400).json({
      message: 'La date de début doit être antérieure à la date de fin.',
    })
  }

  // Vérifier si le type est valide
  if (![1, 2, 3].includes(type)) {
    return res.status(400).json({
      message: 'Le type de la période doit être 1, 2, ou 3.',
    })
  }

  try {
    // Vérifier si la période existe
    const depotStagePeriod = await Period.findOne({ name: 'Dépôt de stage' })

    if (!depotStagePeriod) {
      return res.status(404).json({
        message: "Aucune période de dépôt de stage n'est actuellement ouverte.",
      })
    }

    // Modifier les dates et le type de la période
    depotStagePeriod.start_date = new Date(start_date)
    depotStagePeriod.end_date = new Date(end_date)
    depotStagePeriod.type = type // Update the type field

    // Sauvegarder les modifications
    await depotStagePeriod.save()

    return res.status(200).json({
      message: 'Période de dépôt de stage modifiée avec succès.',
      period: depotStagePeriod,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur lors de la modification de la période.',
      error: error.message,
    })
  }
}
