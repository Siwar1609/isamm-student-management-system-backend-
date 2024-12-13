import Period from '../../models/period-model/period_model.js'
import PFE from '../../models/project_models/project_pfe.js'
import  {pfeValidationSchema } from '../../validators/pfeValidationSchema.js'
import { updatePFEValidation } from '../../validators/updatepfeValidation.js';
import mongoose from 'mongoose'
import nodemailer from 'nodemailer';
import Student from '../../models/users-models/student_model.js';

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
      documentId,
    } = req.body;

    // Validation des données
    const { error } = pfeValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    
    // Vérification si le délai est dépassé
    const period = await Period.findOne({
      name: 'Dépot PFE',
      end_date: { $gte: new Date() },
    })

    if (!period) {
      return res.status(404).json({ message: '❌ Période non trouvée❌' })
    }
       // Validate if documents exist
       for (let docId of documentId) {
        if (!mongoose.Types.ObjectId.isValid(docId)) {
          return res.status(400).json({
            message: `❌ L'ID du document '${docId}' est invalide.`,
          });
        }
        const documentExists = await mongoose.model('Document').findById(docId);
        if (!documentExists) {
          return res.status(404).json({
            message: `❌ Le document avec l'ID '${docId}' n'existe pas.`,
          });
        }
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
      documentId,
      
    });

    // Sauvegarder le PFE dans la base de données
    const savedPFE = await newPFE.save();

    // Populate les champs studentId, documentId, et periodId
    const populatedPFE = await PFE.findById(savedPFE._id)
      .populate('studentId')
      .populate('teacherId', 'firstName lastName email cv')
      .populate('documentId')
      .populate('academicyear');

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
    const { error } = updatePFEValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Récupérer l'ID du PFE et les données envoyées
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier la période actuelle
    const period = await Period.findOne({
      name: 'Dépot PFE',
      end_date: { $gte: new Date() }, // Période encore valide
    });

    if (!period) {
      return res
        .status(404)
        .json({ message: '❌ Période de dépôt non trouvée ou déjà dépassée❌' });
    }

    // Validation supplémentaire pour le mode de travail et les IDs associés
    if (updateData.WorkMode === 'Monome' && updateData.studentId?.length !== 1) {
      return res.status(400).json({
        message: '❌ Si le PFE est "monome", il doit contenir exactement un ID étudiant.',
      });
    }
    if (updateData.WorkMode === 'Binome' && updateData.studentId?.length !== 2) {
      return res.status(400).json({
        message: '❌ Si le PFE est "binome", il doit contenir exactement deux IDs étudiants.',
      });
    }

    // Vérification des IDs référencés
    if (updateData.teacherId && !await mongoose.model('Teacher').findById(updateData.teacherId)) {
      return res.status(400).json({ message: '❌ L\'enseignant spécifié n\'existe pas.' });
    }
    if (updateData.studentId) {
      for (const studentId of updateData.studentId) {
        if (!await mongoose.model('Student').findById(studentId)) {
          return res.status(400).json({ message: '❌ Un ou plusieurs étudiants spécifiés n\'existent pas.' });
        }
      }
    }

    // Vérification des champs autorisés
    const allowedFields = ['company_name', 'title', 'description', 'type', 'teacherId', 'studentId', 'WorkMode', 'affected', 'documentId', 'published', 'isApproved', 'send'];
    const invalidFields = Object.keys(updateData).filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `❌ Champs invalides détectés: ${invalidFields.join(', ')}`,
      });
    }

    // Mise à jour du PFE avec les nouvelles informations
    const updatedPFE = await PFE.findByIdAndUpdate(id, updateData, { new: true });

    // Peupler les champs après mise à jour
    const populatedPFE = await PFE.findById(updatedPFE._id)
      .populate('studentId')
      .populate('teacherId', 'firstName lastName email')
      .populate('documentId')
      .populate('academicyear');

    return res.status(200).json({
      message: '✅ PFE mis à jour avec succès 🎉.',
      data: populatedPFE,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '❌ Erreur serveur.' });
  }
};

//recuperer les details des PFEs pour les étudiants
export const getPFEDetailsForStudent = async (req, res) => {
  try {
    // Recherche des PFEs non affectés avec les étudiants associés
    const availablePFEs = await PFE.find({ affected: false })
      .populate('studentId')
      .populate('teacherId')
      .populate('documentId')
      .populate('academicyear')

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
// Publier ou masquer certains PFEs
export const publishOrHidePFEAssignments2 = async (req, res) => {
  try {
    const { response } = req.params; // "publish" ou "hide"
    const { pfeIds } = req.body; // Liste des IDs des PFEs à mettre à jour

    // Vérification de la validité du paramètre `response`
    if (!["publish", "hide"].includes(response)) {
      return res.status(400).json({
        message: "Valeur invalide pour 'response'. Utilisez 'publish' ou 'hide'.",
      });
    }

    // Vérification de la présence d'IDs de PFEs
    if (!Array.isArray(pfeIds) || pfeIds.length === 0) {
      return res.status(400).json({
        message: "Aucun ID de PFE fourni. Veuillez fournir un tableau d'IDs.",
      });
    }

    // Définir la valeur de `published` en fonction de `response`
    const published = response === "publish";

    // Mise à jour des PFEs spécifiés
    const result = await PFE.updateMany(
      { _id: { $in: pfeIds } },
      { $set: { published } }   
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Aucun PFE correspondant trouvé.",
      });
    }

    res.status(200).json({
      message: `Les PFEs sélectionnés ont été ${published ? "publiés" : "masqués"} avec succès.`,
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
    // Rechercher les étudiants ayant le rôle "student" et niveau approprié
    const students = await Student.find({ role: "student", level: "3" });
    if (!students || students.length === 0) {
      return res.status(404).json({ message: "Aucun étudiant trouvé." });
    }

    // Vérifier s'il existe au moins un PFE avec `send=true`
    const pfeSendStatus = await PFE.findOne({ send: true }).select("send");
    const isFirstSend = !pfeSendStatus; 

    // Vérifier si au moins un PFE existe
    const pfeCount = await PFE.countDocuments();
    if (pfeCount === 0) {
      return res.status(404).json({ message: "Aucun PFE trouvé." });
    }

    // Configurer le transporteur d'email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Définir le contenu de l'email en fonction du type d'envoi
    const subject = isFirstSend
      ? "Planning des PFEs"
      : "Mise à jour : Planning des PFEs";

      const htmlContent = `
      <table style="width: 100%; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <tr>
          <td align="center">
            <table style="width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <tr>
                <td style="background-color: #007bff; color: #ffffff; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px;">
                  <p style="font-size: 16px; color: #333333; line-height: 1.5;">
                    Bonjour,
                  </p>
                  <p style="font-size: 16px; color: #333333; line-height: 1.5;">
                    ${isFirstSend
                      ? "Le planning des PFEs est désormais disponible. Cliquez sur le bouton ci-dessous pour le consulter :"
                      : "Le planning des PFEs a été mis à jour. Cliquez sur le bouton ci-dessous pour consulter la version la plus récente :"}
                  </p>
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="http://wwww.isamm.com" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 16px;">
                      Voir le planning des PFEs
                    </a>
                  </div>
                  <p style="font-size: 16px; color: #333333; line-height: 1.5;">
                    Cordialement,<br />
                    <strong>L'équipe PFE</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f1f1f1; color: #777777; font-size: 14px; text-align: center; padding: 10px;">
                  <p style="margin: 0;">
                    Vous recevez cet email parce que vous faites partie de la liste des destinataires pour les PFEs.
                  </p>
                  <p style="margin: 0;">
                    © 2024 Équipe PFE, Tous droits réservés.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
    // Envoyer les emails aux étudiants
    const emailPromises = students.map((student) => {
      return transporter.sendMail({
        from: '" Équipe PFE 👻" <votre_email@gmail.com>',
        to: student.email,
        subject, 
        html: htmlContent,
      });
    });
    await Promise.all(emailPromises);

    if (isFirstSend) {
      await PFE.updateMany({}, { send: true });
    }

    return res.status(200).json({
      message: `Emails envoyés avec succès (${isFirstSend ? "premier envoi" : "mise à jour"}).`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de l'envoi des emails.",
      error: error.message,
    });
  }
};