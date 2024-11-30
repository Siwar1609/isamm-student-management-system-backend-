import PFA from '../../models/project_models/project_pfa.js'
import PFAValidator from '../../validators/project_pfa_validator.js'
import period_model from '../../models/period-model/period_model.js'

// --------------- Routes for Teacher -------------------------------

export const fetch_my_pfa = async (req, res) => {
  try {
    // Filtre pour récupérer uniquement les sujets postés par l'enseignant authentifié
    const teacherId = req.user._id
    const projects_pfa = await PFA.find({ teacher: teacherId })

    res.status(200).json({ model: projects_pfa, message: 'Succès' })
  } catch (e) {
    res.status(400).json({ error: e.message, message: "Problème d'accès" })
  }
}

export const add_my_pfa = async (req, res) => {
  try {
    // Vérification du rôle de l'utilisateur authentifié
    if (req.user.role !== 'enseignant') {
      return res.status(403).json({
        message:
          "Vous n'êtes pas autorisé à déposer un sujet PFA. Ce rôle est réservé aux enseignants.",
      })
    }

    console.log(req.body)

    // Vérification si le délai est dépassé
    const period = await period_model.findOne({
      name: 'Dépôt des Sujet des PFA',
      end_date: { $gte: new Date() },
    })

    if (!period) {
      return res.status(400).json({
        message: 'Le délai pour le dépôt des sujets PFA est dépassé.',
      })
    }

    // Validation avec Joi
    const validatedData = await PFAValidator.validateAsync(req.body)

    // Ajout automatique de l'ID de l'enseignant authentifié
    const teacherId = req.user._id // Assurez-vous que req.user est correctement configuré via un middleware
    validatedData.teacher = teacherId

    // Création du projet
    const project_pfa = new PFA(validatedData)
    await project_pfa.save()

    // Réponse réussie
    res.status(201).json({ model: project_pfa, message: 'Succès' })
  } catch (error) {
    // Gestion des erreurs
    res.status(400).json({
      error: error.message,
      message: 'Données invalides',
    })
  }
}

export const update_my_pfa = async (req, res) => {
  try {
    // Vérification si le délai est dépassé
    const period = await period_model.findOne({
      name: 'Dépôt des Sujet des PFA',
      end_date: { $gte: new Date() },
    })

    if (!period) {
      return res.status(400).json({
        message: 'Le délai pour la modification des sujets PFA est dépassé.',
      })
    }

    // Récupérer le sujet pour vérifier l'ID du teacher
    const project_pfa = await PFA.findById(req.params.id)

    if (!project_pfa) {
      return res.status(404).json({
        message: 'Sujet PFA non trouvé.',
      })
    }

    // Vérification de l'autorisation
    const teacherId = req.user._id
    if (project_pfa.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier ce sujet PFA.",
      })
    }

    // Mise à jour du sujet
    const updated_pfa = await PFA.findByIdAndUpdate(
      req.params.id,
      { ...req.body, teacher: teacherId },
      { new: true },
    )

    res.status(200).json({
      model: updated_pfa,
      message: 'Sujet PFA modifié avec succès.',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const delete_my_pfa = async (req, res) => {
  try {
    // Vérification si le délai est dépassé
    const period = await Period.findOne({
      name: 'Dépôt des Sujet des PFA',
      end_date: { $gte: new Date() },
    })

    if (!period) {
      return res.status(400).json({
        message: 'Le délai pour la suppression des sujets PFA est dépassé.',
      })
    }

    // Récupérer le sujet pour vérifier l'ID du teacher
    const project_pfa = await PFA.findById(req.params.id)

    if (!project_pfa) {
      return res.status(404).json({
        message: 'Sujet PFA non trouvé.',
      })
    }

    // Vérification de l'autorisation
    const teacherId = req.user._id
    if (project_pfa.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer ce sujet PFA.",
      })
    }

    // Suppression du sujet
    await PFA.deleteOne({ _id: req.params.id })

    res.status(200).json({
      message: 'Sujet PFA supprimé avec succès.',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const fetch_my_pfa_byId = async (req, res) => {
  try {
    // Recherche du sujet PFA par ID
    const project_pfa = await PFA.findOne({ _id: req.params.id })
      .populate('student teacher document') // Assure que les champs sont correctement peuplés
      .exec()
    // Vérification si le projet existe
    if (!project_pfa) {
      return res.status(404).json({
        message: 'Objet non trouvé',
      })
    }
    // Vérification si l'enseignant authentifié est autorisé à accéder au sujet
    if (project_pfa.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message:
          "Accès refusé : vous n'êtes pas autorisé à consulter ce sujet.",
      })
    }
    // Réponse réussie
    res.status(200).json({
      model: project_pfa,
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

// --------------- Controllers for Admin ------------------------------------------

export const fetch_all_pfa = async (req, res) => {
  try {
    const pfas = await PFA.find()
    res.status(200).json({ model: pfas, message: 'success ' })
  } catch (e) {
    res.status(400).json({ error: e.message, message: 'access problem' })
  }
}

export const get_pfa_ByID = async (req, res) => {
  try {
    const project_pfa = await PFA.findOne({ _id: req.params.id })
      .populate('student', 'teacher', 'document')
      .exec()
    if (!project_pfa) {
      res.status(404).json({
        message: 'Object non Trouvé',
      })
    } else {
      res.status(200).json({
        model: project_pfa,
        message: 'Object Trouvé',
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const update_pfa = async (req, res) => {
  try {
    const project_pfa = await PFA.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
      },
    )
    if (!project_pfa) {
      res.status(404).json({
        message: 'Object non Trouvé',
      })
    } else {
      res.status(200).json({
        model: project_pfa,
        message: 'Object modifié',
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const publish_pfa = async (req, res) => {
  try {
    const { response, start_date, end_date } = req.body

    // Vérification de la validité des dates si elles sont fournies
    if (start_date || end_date) {
      if (!start_date || !end_date) {
        return res.status(400).json({
          message:
            'Les deux dates, "start_date" et "end_date", doivent être fournies.',
        })
      }
      if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({
          message: 'La date de début doit être antérieure à la date de fin.',
        })
      }
    }

    if (response) {
      // Publier les PFA non rejetés
      await PFA.updateMany(
        { rejected: { $ne: true } }, // Tous sauf ceux avec le statut "rejected"
        { published: true }, // Attribut qui marque les PFA comme publiés
      )

      // Mettre à jour ou créer une période de choix si les dates sont fournies
      if (start_date && end_date) {
        const period = await period_model.findOneAndUpdate(
          { name: 'Choix sujet PFA' },
          { start_date, end_date },
          { upsert: true, new: true }, // Création si inexistant
        )
        return res.status(200).json({
          message: 'PFA publiés avec succès et période de choix mise à jour.',
          period,
        })
      }

      return res.status(200).json({
        message: 'PFA publiés avec succès.',
      })
    } else {
      // Masquer les PFA
      await PFA.updateMany({}, { published: false }) // Tous les PFA masqués
      return res.status(200).json({
        message: 'Liste des PFA masquée avec succès.',
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Erreur serveur.',
      error: error.message,
    })
  }
}

// export const delete_pfa = async (req, res) => {
//   try {
//     await PFA.deleteOne({ _id: req.params.id })
//     res.status(200).json({
//       message: 'Object supprimé',
//     })
//   } catch (error) {
//     res.status(400).json({ error: error.message })
//   }
// }
