import  periodValidator  from '../../validators/period_validator.js';
import Period from '../../models/period-model/period_model.js';
// Créer une nouvelle période
export const openPFEPeriod = async (req, res) => {
  const { start_date, end_date } = req.body
  const { error } = periodValidator.validate(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }

  if (new Date(start_date) >= new Date(end_date)) {
    return res.status(400).json({
      message: 'La date de début doit être inférieure à la date de fin.',
    })
  }

  try {
    // Vérifier si une période de type "Dépot PFE" est déjà ouverte
    const existingPeriod = await Period.findOne({
      name: 'Dépot PFE',
      start_date: { $lte: new Date() },
      end_date: { $gte: new Date() },
    })

    if (existingPeriod) {
      return res.status(400).json({
        message: 'Une période de dépôt PFE est déjà ouverte.',
      })
    }

    // Créer une nouvelle période pour le dépôt PFE
    const newPeriod = new Period({
      name: 'Dépot PFE',
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    });
  

    await newPeriod.save()
    return res.status(201).json({
      message: 'La période de dépôt des PFEs a été ouverte avec succès.',
      period: newPeriod,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de l'ouverture de la période.",
      error: error.message,
    })
  }
}

export const getPFEPeriod = async (req, res) => {
  try {
    // Rechercher une période active de type "Dépot PFE"
    const pfePeriod = await Period.findOne({ name: 'Dépot PFE' })

    if (!pfePeriod) {
      return res.status(404).json({
        message: "Aucune période de dépôt PFE n'est actuellement ouverte.",
      })
    }

    return res.status(200).json({
      message:
        'Informations sur la période de dépôt PFE récupérées avec succès.',
      period: pfePeriod,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur lors de la récupération des informations de la période.',
      error: error.message,
    })
  }
}
export const updatePFEPeriod = async (req, res) => {
  const { start_date, end_date } = req.body;

  // ✅ Valider les données avec le validateur
  const { error } = periodValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: `⚠️ Erreur de validation : ${error.details[0].message}` 
    });
  }

  try {
    const today = new Date();

    // 🔍 Trouver la période active de dépôt PFE
    const activePFEPeriod = await Period.findOne({
      name: 'Dépot PFE',
      start_date: { $lte: today }, // Début avant ou égal à aujourd'hui
      end_date: { $gte: today },  // Fin après ou égal à aujourd'hui
    });

    if (!activePFEPeriod) {
      return res.status(404).json({
        message: "❌ Aucune période de dépôt PFE active n'a été trouvée.",
      });
    }

    // 📅 Vérifier que start_date est avant end_date
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        message: '⏳ La date de début doit être antérieure à la date de fin.',
      });
    }

    // 🛠️ Mettre à jour les dates de la période
    activePFEPeriod.start_date = new Date(start_date);
    activePFEPeriod.end_date = new Date(end_date);

    // 💾 Sauvegarder les modifications
    await activePFEPeriod.save();

    return res.status(200).json({
      message: '✅ Période de dépôt PFE active modifiée avec succès 🎉.',
      period: activePFEPeriod,
    });
  } catch (error) {
    return res.status(500).json({
      message: '❗ Une erreur est survenue lors de la modification de la période.',
      error: error.message,
    });
  }
};

