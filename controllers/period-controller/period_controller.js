import period_model from '../../models/period-model/period_model.js'
import periodValidator from '../../validators/period_validator.js'

export const fetch_pfa_period = async (req, res) => {
  try {
    const periods = await period_model.find({
      $and: [
        { name: 'Dépôt des Sujet des PFA' },
        { end_date: { $lt: new Date() } }, // end_date < date actuelle
      ],
    })

    if (periods.length === 0) {
      return res.status(404).json({
        message:
          "Aucun enregistrement trouvé pour 'Dépôt PFA' avec une date de fin passée.",
      })
    }

    res.status(200).json({ data: periods, message: 'Succès' })
  } catch (e) {
    res.status(500).json({ error: e.message, message: "Problème d'accès" })
  }
}

export const get_period_ByID = async (req, res) => {
  try {
    const period = await period_model.findOne({ _id: req.params.id })
    if (!period) {
      res.status(404).json({
        message: 'Object non Trouvé',
      })
    } else {
      res.status(200).json({
        model: period,
        message: 'Object Trouvé',
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const addPeriod = async (req, res) => {
  try {
    // Validation avec Joi
    const validatedData = await periodValidator.validateAsync(req.body)

    // Création de la période
    const period = new period_model(validatedData)
    await period.save()

    // Réponse réussie
    res.status(201).json({ model: period, message: 'Succès' })
  } catch (error) {
    if (error.isJoi) {
      // Gestion des erreurs
      res.status(400).json({
        error: error.message,
        message: 'Données invalides',
      })
    }
  }
}

export const UpdatePeriod = async (req, res) => {
  try {
    const period = await period_model.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
      },
    )
    if (!period) {
      res.status(404).json({
        message: 'Object non Trouvé',
      })
    } else {
      res.status(200).json({
        model: period,
        message: 'Object modifié',
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
