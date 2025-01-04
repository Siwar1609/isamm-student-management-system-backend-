import PFA from '../../models/project_models/project_pfa.js'
import pv_pfa from '../../models/soutenances-models/pv_pfa.js'
import soutenance_pfa from '../../models/soutenances-models/soutenance_pfa.js'

export const createPV = async (req, res) => {
  try {
    const { soutenanceId } = req.params

    // Récupérer la soutenance associée
    const soutenance = await soutenance_pfa
      .findById(soutenanceId)
      .populate('list_of_student', 'firstName lastName _id')
      .populate('rapporteur', '_id')
      .populate('encadrant', '_id')
    console.log(soutenance)
    if (!soutenance) {
      return res.status(404).json({ message: 'Soutenance introuvable.' })
    }

    // Récupérer le PFA associé
    const pfa = await PFA.findById(soutenance.pfa)
    if (!pfa) {
      return res.status(404).json({ message: 'Sujet PFA introuvable.' })
    }

    // Vérifier si un PV existe déjà pour cette soutenance
    const existingPV = await pv_pfa.findOne({ soutenance: soutenance._id })
    if (existingPV) {
      return res.status(400).json({
        message: 'Un PV existe déjà pour cette soutenance.',
        pv: existingPV,
      })
    }

    // Créer un nouveau PV
    const newPV = new pv_pfa({
      soutenance: soutenance._id,
      pfaCode: pfa._id,
      sujetpfa: pfa.title,
      list_of_student: soutenance.list_of_student.map((student) => student._id),
      rapporteur: soutenance.rapporteur._id,
      encadrant: soutenance.encadrant._id,
      note1: {},
      note2: {},
      note3: {},
      finalNote: null,
      observations: '',
    })

    // Sauvegarder le PV
    const savedPV = await newPV.save();

    return res.status(201).json({
      message: 'PV créé avec succès.',
      pv: newPV,
    })
  } catch (error) {
    console.error('Erreur lors de la création du PV :', error)
    return res.status(500).json({
      message: 'Erreur lors de la création du PV.',
      error: error.message,
    })
  }
}

export const updatePV = async (req, res) => {
  try {
    const { id } = req.params

    // Récupérer le PV existant
    const pv = await pv_pfa.findById(id)
    if (!pv) {
      return res.status(404).json({ message: 'PV introuvable.' })
    }

    // Vérifier les permissions (rapporteur ou encadrant uniquement)
    if (
      pv.rapporteur.toString() !== req.auth.userId &&
      pv.encadrant.toString() !== req.auth.userId
    ) {
      return res.status(403).json({
        message: "Accès refusé : vous n'êtes pas autorisé à modifier ce PV.",
      })
    }

    // Mettre à jour les champs autorisés
    const updates = req.body

    // Recalculer les moyennes si des notes sont fournies
    if (updates.note1) {
      const { autonomy, seriousness, progress, workCompletion } = updates.note1
      updates.note1.average =
        ((autonomy || 0) +
          (seriousness || 0) +
          (progress || 0) +
          (workCompletion || 0)) /
        4
    }

    if (updates.note2) {
      const {
        demoQuality,
        reportQuality,
        subjectMastery,
        workConsistency,
        innovativeTech,
      } = updates.note2
      updates.note2.average =
        ((demoQuality || 0) +
          (reportQuality || 0) +
          (subjectMastery || 0) +
          (workConsistency || 0) +
          (innovativeTech || 0)) /
        5
    }

    if (updates.note3) {
      const {
        demoQuality,
        reportQuality,
        subjectMastery,
        workConsistency,
        innovativeTech,
      } = updates.note3
      updates.note3.average =
        ((demoQuality || 0) +
          (reportQuality || 0) +
          (subjectMastery || 0) +
          (workConsistency || 0) +
          (innovativeTech || 0)) /
        5
    }

    // Recalculer la note finale
    updates.finalNote =
      ((updates.note2?.average || pv.note2?.average || 0) * 2.5 +
        (updates.note3?.average || pv.note3?.average || 0) * 2.5) /
        2 +
      (updates.note1?.average || pv.note1?.average || 0) * 1.5

    // Mettre à jour les observations si fournies
    if (updates.observations) {
      pv.observations = updates.observations
    }

    // Appliquer les mises à jour
    Object.assign(pv, updates)
    const updatedPV = await pv.save()

    // Ajouter la note dans pfaSubject

    return res.status(200).json({
      message: 'PV mis à jour avec succès.',
      pv: updatedPV,
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du PV :', error)
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour du PV.',
      error: error.message,
    })
  }
}

export const fetch_my_pv = async (req, res) => {
  try {
    // Recherche de la soutenance par ID avec `populate`
    const pv = await pv_pfa
      .findOne({ _id: req.params.id })

    // Vérification si le projet existe
    if (!pv) {
      return res.status(404).json({
        message: 'Objet non trouvé',
      })
    }
    // Vérification si l'enseignant authentifié est autorisé à accéder au sujet
    const studentId = req.auth.userId
    if (
      !pv.list_of_student.some(
        (student) => student._id.toString() === studentId.toString(),
      )
    ) {
      return res.status(403).json({
        message:
          "Vous n'êtes pas autorisé à consulter ce pv.",
      })
    }
    // Réponse réussie
    res.status(200).json({
      model: pv,
      message: 'Objet trouvé',
    })
  } catch (error) {
    // Gestion des erreurs
    res.status(400).json({
      error: error.message,
      message: 'Erreur lors de la récupération des données',
    })
  }
}

export const fetch_my_pv_teacher = async (req, res) => {
  try {
    // Recherche de la soutenance par ID avec `populate`
    const pv = await pv_pfa
      .findOne({ _id: req.params.id })

    // Vérification si le projet existe
    if (!pv) {
      return res.status(404).json({
        message: 'Objet non trouvé',
      })
    }
    // Vérification si l'enseignant authentifié est autorisé à accéder au sujet
    const teacherId = req.auth.userId
    if (
      soutenance.rapporteur.toString() !== teacherId.toString() &&
      soutenance.encadrant.toString() !== teacherId.toString()
    ) {
      return res.status(403).json({
        message:
          "Accès refusé : vous n'êtes pas autorisé à consulter ce sujet.",
      })
    } {
      return res.status(403).json({
        message:
          "Vous n'êtes pas autorisé à consulter ce pv.",
      })
    }
    // Réponse réussie
    res.status(200).json({
      model: pv,
      message: 'Objet trouvé',
    })
  } catch (error) {
    // Gestion des erreurs
    res.status(400).json({
      error: error.message,
      message: 'Erreur lors de la récupération des données',
    })
  }
}

