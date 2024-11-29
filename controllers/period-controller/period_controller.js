import period_model from '../../models/period-model/period_model'

export const fetch_pfa = async (req, res) => {
    try {
      const periods = await period_model.find({ name: "Dépôt des Sujet des PFA" }); // Filtrer par le champ 'name'
      if (periods.length === 0) {
        return res.status(404).json({ message: "Aucun enregistrement trouvé pour 'Dépôt PFA'." });
      }
      res.status(200).json({ data: periods, message: "Succès" });
    } catch (e) {
      res.status(500).json({ error: e.message, message: "Problème d'accès" });
    }
  };
  

export const get_period_ByID = async (req, res) => {
  try {
    const period = await PFA.findOne({ _id: req.params.id })
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
    const period = new period_model(req.body)
    await period.save()

    res.status(201).json({ model: period, message: 'success ' })
  } catch (error) {
    res.status(201).json({
      error: error.message,
      message: 'Données Invalides ',
    })
  }
}
