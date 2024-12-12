import Period from '../../models/period-model/period_model.js'
import PFE from '../../models/project_models/project_pfe.js'
import Student from '../../models/users-models/student_model.js'
import  {pfeValidationSchema } from '../../validators/pfeValidationSchema.js'
import { updatePFEValidation } from '../../validators/updatepfeValidation.js';
import mongoose from 'mongoose'
import nodemailer from 'nodemailer'

// Méthode pour ouvrir une période de dépôt PFE
export const addPFE = async (req, res) => {
  try {
    // Extraire les données du corps de la requête
    const {
      company_name,
      title,
      description,
      type,
      teacherId,
      studentId,  
      WorkMode,
      affected,
      academicYear,
      documentId,
      periodId,
    } = req.body;

    // Validation des données
    const { error } = pfeValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifier si la période est ouverte
    const period = await Period.findById(req.body.periodId);
    if (!period) {
      return res.status(404).json({ message: '❌ Période non trouvée.' });
    }
    if (period.start_date > new Date()) {
      return res
        .status(400)
        .json({ message: "⏳ La période de dépôt n'est pas encore ouverte." });
    }

    // Validation du nombre d'étudiants en fonction du type
    if (WorkMode === "Monome" && studentId.length !== 1) {
      return res.status(400).json({
        message:
          '❌ Si le PFE est "monome", il doit contenir exactement un ID étudiant.',
      });
    }

    if (WorkMode === "Binome" && studentId.length !== 2) {
      return res.status(400).json({
        message:
          '❌ Si le PFE est "binome", il doit contenir exactement deux IDs étudiants.',
      });
    }

    // Créer un nouveau PFE
    const newPFE = new PFE({
      company_name,
      title,
      description,
      type,
      teacherId,
      studentId,
      WorkMode,
      affected,
      academicYear,
      documentId,
      periodId,
    });

    // Sauvegarder le PFE dans la base de données
    const savedPFE = await newPFE.save();

    // Populate les champs studentId, documentId, et periodId
    const populatedPFE = await PFE.findById(savedPFE._id)
      .populate('studentId')
      .populate('teacherId', 'firstName lastName email cv')
      .populate('documentId')
      .populate('periodId', 'name start_date end_date') // récupérer le nom et les dates de la période
      .populate('academicYear');

    return res.status(201).json({
      message: '✅ PFE ajouté avec succès 🎉.',
      pfe: populatedPFE,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: '❗ Erreur du serveur.', error: err.message });
  }
};

   
// Méthode pour mettre à jour un PFE
export const updatePFE = async (req, res) => {
  try {
    // Validation des données du corps de la requête
    const { error } = updatePFEValidation.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    // Récupérer l'ID du PFE et les données envoyées
    const { id } = req.params
    const updateData = req.body

    // Vérifier la période actuelle et si la période est déjà dépassée
    const pfe = await PFE.findById(id).populate('periodId') // Récupérer le PFE avec la période associée

    if (!pfe) {
      return res.status(404).json({ message: 'PFE non trouvé' })
    }

    const period = pfe.periodId
    const currentDate = new Date()

    if (currentDate > period.end_date) {
      return res
        .status(400)
        .json({ message: 'Les délais de dépôt sont dépassés.' })
    }

    // Mise à jour du PFE avec les nouvelles informations
    const updatedPFE = await PFE.findByIdAndUpdate(id, updateData, {
      new: true,
    })

    return res
      .status(200)
      .json({ message: 'PFE mis à jour avec succès.', data: updatedPFE })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erreur serveur.' })
  }
}
//recuperer les details des PFEs pour les étudiants
export const getPFEDetailsForStudent = async (req, res) => {
  try {
    // Recherche des PFEs non affectés avec les étudiants associés
    const availablePFEs = await PFE.find({ affected: false })
      .populate('studentId')
      .populate('teacherId')
      .populate('documentId')
      .populate('periodId')
      .populate('academicYear')

    if (availablePFEs.length === 0) {
      return res.status(404).json({ message: 'Aucun PFE disponible.' })
    }

    res.status(200).json(availablePFEs)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Erreur lors de la récupération des PFEs disponibles.',
      error,
    })
  }
}

// Fonction pour qu'un enseignant choisisse un PFE
export const choosePFE = async (req, res) => {
  const { id } = req.params;
  const teacherId = req.auth.userId; 

  try {
    // Vérifier si le PFE existe
    const pfe = await PFE.findById(id);

    if (!pfe) {
      return res.status(404).json({ message: 'PFE non trouvé.' });
    }

    // Vérifier si ce PFE a déjà un enseignant
    if (pfe.teacherId) {
      return res
        .status(400)
        .json({ message: 'Ce PFE a déjà été choisi par un autre enseignant.' });
    }

    // Assigner l'enseignant et mettre à jour le statut
    pfe.teacherId = teacherId;
    pfe.affected = true;
    await pfe.save();

    res.status(200).json({ message: 'PFE choisi avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du PFE.', error });
  }
};


//User Story 4.2: sélectionner les PFE et valider le choix des encadrants. Le statut des PFE va changer
export const assignTeachersToPFE = async (req, res) => {
  try {
    const { pfeIds } = req.body; // Liste des IDs de PFEs

    if (!Array.isArray(pfeIds) || pfeIds.length === 0) {
      return res.status(400).json({
        message: 'La liste des IDs de PFEs est vide ou invalide.',
      });
    }

    // Recherche des PFEs à mettre à jour
    const pfes = await PFE.find({ _id: { $in: pfeIds } });

    // Vérifier si tous les PFEs existent et si un enseignant est assigné
    const errors = [];
    pfes.forEach((pfe) => {
      if (!pfe.teacherId) {
        errors.push({
          id: pfe._id,
          title: pfe.title,
          message: "Aucun enseignant assigné à ce PFE.",
        });
      }
    });

    // Si des erreurs sont trouvées, renvoyer un message d'erreur
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Certains PFEs n'ont pas d'enseignants assignés.",
        errors,
      });
    }

    // Mettre à jour les PFEs pour marquer qu'ils sont affectés
    await PFE.updateMany(
      { _id: { $in: pfeIds } },
      { $set: { affected: true ,isApproved: true} } // Marquer comme affecté
    );

    res.status(200).json({
      message: 'Les enseignants ont été assignés avec succès aux PFEs sélectionnés.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de l'affectation des enseignants aux PFEs.",
      error,
    });
  }
};
//affecter manuellement  un sujet à un enseignant
export const assignTeacherToPFEManually = async (req, res) => {
  try {
    const { id } = req.params; // ID du PFE
    const { teacherId, force } = req.body; // ID du nouvel enseignant et option "force"

      // Vérification que teacherId est un ObjectId valide
      if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({
          message: "L'ID de l'enseignant est invalide. Assurez-vous qu'il s'agit d'un ObjectId valide.",
        });
      }

    // Recherche du PFE par ID
    const pfe = await PFE.findById(id).populate('teacherId');
    if (!pfe) {
      return res.status(404).json({
        message: 'Le PFE demandé est introuvable.',
      });
    }

    // Vérification si le PFE est déjà affecté
    if (pfe.affected && pfe.teacherId && force !== true) {
      return res.status(400).json({
        message: `Le PFE est déjà affecté à ${pfe.teacherId.name}. Utilisez 'force: true' pour réaffecter.`,
      });
    }

    // Si force = true, réaffecter le PFE
    if (pfe.affected && pfe.teacherId && force === true) {
      console.log(`Réaffectation : PFE retiré de l'enseignant précédent ${pfe.teacherId.name}`);
    }

    // Mise à jour du PFE avec le nouvel enseignant
    pfe.teacherId = teacherId;
    pfe.affected = true;
    pfe.isApproved=true;
    await pfe.save();

    res.status(200).json({
      message: `Le PFE a été assigné avec succès à l'enseignant avec l'ID ${teacherId}.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de l'affectation de l'enseignant au PFE.",
      error,
    });
  }
};
//affecter manuellement  un sujet à un enseignant2
export const assignTeacherToPFEManually2 = async (req, res) => {
  try {
    const { idStage, teacherId, force } = req.body;

    // Vérification que `idStage` et `teacherId` sont des ObjectId valides
    if (!mongoose.Types.ObjectId.isValid(idStage)) {
      return res.status(400).json({
        message: "L'ID du stage est invalide. Assurez-vous qu'il s'agit d'un ObjectId valide.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        message: "L'ID de l'enseignant est invalide. Assurez-vous qu'il s'agit d'un ObjectId valide.",
      });
    }

    // Recherche du PFE à l'aide de l'ID
    const pfe = await PFE.findById(idStage).populate('teacherId');
    if (!pfe) {
      return res.status(404).json({
        message: 'Le PFE demandé est introuvable.',
      });
    }

    // Vérification si le PFE est déjà affecté
    if (pfe.affected && pfe.teacherId && String(pfe.teacherId._id) !== teacherId && force !== true) {
      return res.status(400).json({
        message: `Le PFE est déjà affecté à ${pfe.teacherId.name}. Utilisez 'force: true' pour réaffecter.`,
      });
    }

    // Réaffectation si `force` est défini sur true
    if (pfe.affected && pfe.teacherId && String(pfe.teacherId._id) !== teacherId && force === true) {
      console.log(`Réaffectation : PFE retiré de l'enseignant précédent ${pfe.teacherId.name}`);
    }

    // Mise à jour du PFE avec le nouvel enseignant
    pfe.teacherId = teacherId;
    pfe.affected = true;
    pfe.isApproved=true;
    await pfe.save();

    res.status(200).json({
      message: `Le PFE a été assigné avec succès à l'enseignant avec l'ID ${teacherId}.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de l'affectation de l'enseignant au PFE.",
      error,
    });
  }
};

//publier ou masquer les PFEs
export const publishOrHidePFEAssignments = async (req, res) => {
  try {
    const { response } = req.params;

    // Vérification de la validité du paramètre `response`
    if (!["publish", "hide"].includes(response)) {
      return res.status(400).json({
        message: "Valeur invalide pour 'response'. Utilisez 'publish' ou 'hide'.",
      });
    }

    // Définir la valeur de `published` en fonction de `response`
    const published = response === "publish";

    // Mise à jour de tous les PFEs
    const result = await PFE.updateMany({}, { $set: { published } });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Aucun PFE trouvé dans la base de données.",
      });
    }

    res.status(200).json({
      message: `Tous les PFEs ont été ${published ? "publiés" : "masqués"} avec succès.`,
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'état de publication des PFEs.",
      error,
    });
  }
};
//envoyer le planning des PFEs par email

export const send_pfe_planning = async (req, res) => {
  try {
  
    const { emails, planningLink } = req.body;

    if (!emails || emails.length === 0 || !planningLink) {
      return res.status(400).json({ message: "Emails or planning link is missing." });
    }

    // vérifier si le planning est déja envoyé
    const pfeStatus = await PFE.findOne({ send: true }).select("send");
    const isFirstSend = !pfeStatus;

    // Configuration de Nodemailer pour l'envoi d'email
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // definirr  le contenu de l'email
    const subject = isFirstSend
      ? "Planning des PFEs"
      : "Mise à jour : Planning des PFEs";

    const htmlContent = isFirstSend
      ? `
        <p>Bonjour,</p>
        <p>Le planning des PFEs est désormais disponible. Cliquez sur le lien ci-dessous pour le consulter :</p>
        <a href="${planningLink}">Voir le planning des PFEs</a>
        <p>Cordialement,</p>
        <p>L'équipe PFE</p>
      `
      : `
        <p>Bonjour,</p>
        <p>Le planning des PFEs a été mis à jour. Cliquez sur le lien ci-dessous pour consulter la version la plus récente :</p>
        <a href="${planningLink}">Voir le planning mis à jour</a>
        <p>Cordialement,</p>
        <p>L'équipe PFE</p>
      `;

    // Envoi des emails aux destinataires
    const emailPromises = emails.map((email) =>
      transporter.sendMail({
        from: '"Équipe PFE 👻" <alimekni5@gmail.com>',
        to: email,
        subject,
        html: htmlContent,
      })
    );

   // Attendre l'envoi de tous les emails
    await Promise.all(emailPromises);

    // Marquer tous les PFEs comme envoyés
    if (isFirstSend) {
      await PFE.updateMany({}, { send: true });
    }

    return res.status(200).json({
      message: `Emails envoyés avec succès (${isFirstSend ? "premier envoi" : "mise à jour"}).`,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi des emails:", error);

    return res.status(500).json({
      message: "Erreur lors de l'envoi des emails.",
      error: error.message,
    });
  }
};