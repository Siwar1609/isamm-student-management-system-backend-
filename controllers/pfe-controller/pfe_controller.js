import Period from '../../models/period-model/period_model.js'
import PFE from '../../models/project_models/project_pfe.js'
import  {pfeValidationSchema } from '../../validators/pfeValidationSchema.js'
import { updatePFEValidation } from '../../validators/updatepfeValidation.js';
import mongoose from 'mongoose'
import nodemailer from 'nodemailer';
import Student from '../../models/users-models/student_model.js';
import SoutenancePfe from '../../models/soutenances-models/soutenance_pfe.js';
import Teacher from '../../models/users-models/teacher_model.js';
import {updateSoutenanceValidation} from '../../validators/updatePfeSoutenance_Validator.js';

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
        from: `" Équipe PFE 👻" <${process.env.EMAIL_USER}>`,
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

export const assignTeacherToSoutenance = async (req, res) => {
  try {
    const { projectId, salle, date, teachers } = req.body; // Tableau des enseignants : [{ teacherId, role }]

    // Vérification que le projet PFE existe
    const pfe = await PFE.findById(projectId);
    if (!pfe) {
      return res.status(404).json({ message: "❌ Projet PFE introuvable." });
    }

    // Vérification si une soutenance existe déjà pour ce projet PFE
    let soutenance = await SoutenancePfe.findOne({ projectId }).populate("projectId");

    // Si aucune soutenance n'existe, créer une nouvelle soutenance
    if (!soutenance) {
      soutenance = new SoutenancePfe({
        projectId,
        students: pfe.studentId,
        academicYear: pfe.academicyear,
        teachers: [{ teacherId: pfe.teacherId, role: "encadrant" }], // Ajout automatique de l'encadrant
      });
    }

    // Vérification des chevauchements d'horaires et de salles
    const chevauchement = await SoutenancePfe.findOne({
      salleSoutenance: salle,
      dateSoutenance: { $eq: new Date(date) },
      projectId: { $ne: projectId },
    });

    if (chevauchement) {
      return res.status(400).json({
        message: "❌ Une autre soutenance est déjà planifiée dans cette salle à cette heure.",
      });
    }

    // Ajout des enseignants fournis dans la requête
    for (const teacher of teachers) {
      const { teacherId, role } = teacher;

      // Vérifier si l'enseignant existe
      const teacherExists = await Teacher.findById(teacherId);
      if (!teacherExists) {
        return res.status(400).json({
          message: `❌ L'enseignant avec l'ID ${teacherId} n'existe pas.`,
        });
      }
        // Vérifier si un rôle unique (président de jury ou rapporteur) est déjà attribué
        if (
          ["président de jury", "rapporteur"].includes(role) &&
          soutenance.teachers.some((existingTeacher) => existingTeacher.role === role)
        ) {
          return res.status(400).json({
            message: `❌ Un ${role} est déjà assigné à cette soutenance.`,
          });
        }

      // Vérifier si l'enseignant est déjà assigné avec le même rôle
      const alreadyAssigned = soutenance.teachers.some(
        (existingTeacher) =>
          existingTeacher.teacherId.toString() === teacherId.toString() &&
          existingTeacher.role === role
      );

      if (alreadyAssigned) {
        return res.status(400).json({
          message: `❌ L'enseignant ${teacherId} est déjà assigné à cette soutenance avec le rôle ${role}.`,
        });
      }
      // Vérifier si l'enseignant est déjà assigné à une autre soutenance avec la même date
  const conflictSoutenance = await SoutenancePfe.findOne({
    "teachers.teacherId": teacherId,
    date: date, 
  });

  if (conflictSoutenance) {
    return res.status(400).json({
      message: `❌ L'enseignant ${teacherId} est déjà assigné à une autre soutenance le ${date}.`,
    });
  }

      // Ajouter l'enseignant avec son rôle à la soutenance
      soutenance.teachers.push({ teacherId, role });
    }

    // Mettre à jour les informations de la soutenance
    soutenance.salleSoutenance = salle;
    soutenance.dateSoutenance = new Date(date);

    // Sauvegarder les modifications
    await soutenance.save();

    return res.status(200).json({
      message: "✅ Enseignants assignés avec succès à la soutenance.",
      soutenance: await SoutenancePfe.findById(soutenance._id)
        .populate("students", "firstName lastName email")
        .populate("teachers.teacherId", "firstName lastName email")
        .populate("projectId", "title description"),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "❌ Une erreur est survenue lors de l'assignation.",
      error: error.message,
    });
  }
};


export const send_soutenance_planning = async (req, res) => {
  try {
    // Rechercher les étudiants ayant le rôle "student" et niveau approprié
    const students = await Student.find({ role: "student", level: "3" }).select("email");
    if (!students || students.length === 0) {
      return res.status(404).json({ message: "Aucun étudiant trouvé." });
    }

    // Rechercher les enseignants liés aux soutenances
    const soutenances = await SoutenancePfe.find()
      .populate({
        path: "teachers.teacherId", // Charger les enseignants (encadrants, rapporteurs, etc.)
        select: "email",
      })
      .select("teachers");

    const teachers = [];
    soutenances.forEach((soutenance) => {
      soutenance.teachers.forEach((teacher) => {
        if (teacher.teacherId && teacher.teacherId.email) {
          teachers.push(teacher.teacherId.email);
        }
      });
    });

    // Fusionner les listes d'e-mails (enseignants et étudiants) et supprimer les doublons
    const recipients = [
      ...new Set([...students.map((s) => s.email), ...teachers]),
    ];

    // Vérifier s'il existe au moins une soutenance avec `send=true`
    const soutenanceSendStatus = await SoutenancePfe.findOne({ send: true }).select("send");
    const isFirstSend = !soutenanceSendStatus;

    // Vérifier si au moins une soutenance existe
    const soutenanceCount = await SoutenancePfe.countDocuments();
    if (soutenanceCount === 0) {
      return res.status(404).json({ message: "Aucune soutenance trouvée." });
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
      ? "Planning des Soutenances"
      : "Mise à jour : Planning des Soutenances";

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
                    ${
                      isFirstSend
                        ? "Le planning des soutenances est désormais disponible. Cliquez sur le bouton ci-dessous pour le consulter :"
                        : "Le planning des soutenances a été mis à jour. Cliquez sur le bouton ci-dessous pour consulter la version la plus récente :"
                    }
                  </p>
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="http://wwww.isamm.com" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 16px;">
                      Voir le planning des soutenances
                    </a>
                  </div>
                  <p style="font-size: 16px; color: #333333; line-height: 1.5;">
                    Cordialement,<br />
                    <strong>L'équipe Soutenance</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f1f1f1; color: #777777; font-size: 14px; text-align: center; padding: 10px;">
                  <p style="margin: 0;">
                    Vous recevez cet email parce que vous faites partie de la liste des destinataires pour les soutenances.
                  </p>
                  <p style="margin: 0;">
                    © 2024 Équipe Soutenance, Tous droits réservés.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    // Envoyer les emails à tous les destinataires
    const emailPromises = recipients.map((email) => {
      return transporter.sendMail({
        from: `"Équipe PFE 👻" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: htmlContent,
      });
    });
    await Promise.all(emailPromises);

    // Mettre à jour le statut d'envoi
    if (isFirstSend) {
      await SoutenancePfe.updateMany({}, { send: true });
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

export const publishOrHideSoutenances = async (req, res) => {
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

    // Mise à jour de toutes les SoutenancePfes
    const result = await SoutenancePfe.updateMany({}, { $set: { published } });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Aucune soutenance trouvée dans la base de données.",
      });
    }

    res.status(200).json({
      message: `Toutes les soutenances ont été ${published ? "publiées" : "masquées"} avec succès.`,
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'état de publication des soutenances.",
      error,
    });
  }
};



export const updateSoutenance = async (req, res) => {
  try {
    // Validation des données de la requête
    const { id } = req.params;
    const { salleSoutenance, dateSoutenance, teachers = [] } = req.body;
    
    // Récupérer la soutenance existante
    const soutenance = await SoutenancePfe.findById(id).populate('projectId');
    if (!soutenance) {
      return res.status(404).json({ message: '❌ Soutenance non trouvée' });
    }

    // Vérification des chevauchements d'horaires et de salles
    const salleConflict = await SoutenancePfe.findOne({
      salleSoutenance: salleSoutenance || soutenance.salleSoutenance,
      dateSoutenance: { $eq: new Date(dateSoutenance || soutenance.dateSoutenance) },
      _id: { $ne: id }, // Exclure la soutenance actuelle
    });

    if (salleConflict) {
      return res.status(400).json({
        message: "❌ Une autre soutenance est déjà planifiée dans cette salle à cette heure.",
      });
    }

    // Vérification des enseignants et des rôles
    for (const teacherData of teachers) {
      const { teacherId, role } = teacherData;

      // Vérification si l'enseignant existe
      const teacherExists = await Teacher.findById(teacherId);
      if (!teacherExists) {
        return res.status(400).json({
          message: `❌ L'enseignant avec l'ID ${teacherId} n'existe pas.`,
        });
      }

      // Vérifier si l'enseignant est déjà assigné à cette soutenance avec ce rôle
      const alreadyAssigned = soutenance.teachers.some(
        (existingTeacher) =>
          existingTeacher.teacherId.toString() === teacherId.toString() &&
          existingTeacher.role === role
      );
      
      if (alreadyAssigned) {
        return res.status(400).json({
          message: `❌ L'enseignant ${teacherId} est déjà assigné à cette soutenance avec le rôle ${role}.`,
        });
      }

      // Vérifier si l'enseignant a une autre soutenance au même moment
      const conflict = await SoutenancePfe.findOne({
        "teachers.teacherId": teacherId,
        dateSoutenance: { $eq: new Date(dateSoutenance || soutenance.dateSoutenance) },
        _id: { $ne: id }, // Exclure la soutenance actuelle
      });

      if (conflict) {
        return res.status(400).json({
          message: `❌ L'enseignant ${teacherId} a déjà une autre soutenance prévue à cette date.`,
        });
      }
    }
    // Gestion des enseignants à rôles spécifiques
    // On met à jour ou ajoute les enseignants avec des rôles spécifiques comme rapporteur ou président de jury
    teachers.forEach(({ teacherId, role }) => {
      if (role === 'rapporteur') {
        const existingRapporteurIndex = soutenance.teachers.findIndex(
          (teacher) => teacher.role === 'rapporteur'
        );
        if (existingRapporteurIndex !== -1) {
          soutenance.teachers[existingRapporteurIndex] = { teacherId, role };
        } else {
          soutenance.teachers.push({ teacherId, role });
        }
      } else if (role === 'président de jury') {
        const existingPresidentIndex = soutenance.teachers.findIndex(
          (teacher) => teacher.role === 'président de jury'
        );
        if (existingPresidentIndex !== -1) {
          soutenance.teachers[existingPresidentIndex] = { teacherId, role };
        } else {
          soutenance.teachers.push({ teacherId, role });
        }
      } else {
        // Ajouter les autres enseignants sans changement
        const existingTeacherIndex = soutenance.teachers.findIndex(
          (teacher) => teacher.teacherId.toString() === teacherId.toString()
        );
        if (existingTeacherIndex === -1) {
          soutenance.teachers.push({ teacherId, role });
        }
      }
    });

    // Ajout ou maintien de l'encadrant
    const existingEncadrant = soutenance.teachers.find(
      (teacher) => teacher.role === 'encadrant'
    );

    if (existingEncadrant) {
      // Si l'encadrant existe déjà, ne pas l'ajouter à nouveau
      soutenance.teachers = soutenance.teachers.filter(
        (teacher) => teacher.role !== 'encadrant'
      );
      soutenance.teachers.push(existingEncadrant);
    }


    // Mise à jour des données
    soutenance.salleSoutenance = salleSoutenance || soutenance.salleSoutenance;
    soutenance.dateSoutenance = new Date(dateSoutenance || soutenance.dateSoutenance);
  

    // Sauvegarder les modifications
    await soutenance.save();

    return res.status(200).json({
      message: '✅ Soutenance mise à jour avec succès',
      data: await SoutenancePfe.findById(id)
        .populate("projectId", "title description")
        .populate("students", "firstName lastName email")
        .populate("teachers.teacherId", "firstName lastName email")
        .select("-academicYear")

    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "❌ Erreur lors de la mise à jour de la soutenance.",
      error: error.message,
    });
  }
};

export const getTeacherSoutenances = async (req, res) => {
  try {
    const teacherId = req.auth.userId; // ID de l'enseignant connecté


    // Récupérer toutes les soutenances où l'enseignant est impliqué
    const teacherSoutenances = await SoutenancePfe.find({
      "teachers.teacherId": teacherId,
    }).populate("projectId", "title description")
    .populate("students", "firstName lastName email")
    .select("-academicYear")
    


    // Liste pour stocker les enseignants avec leurs détails
    const populatedTeachers = [];

    // Parcours des soutenances pour peupler les enseignants avec leurs détails
    for (let soutenance of teacherSoutenances) {
      // Parcours des enseignants dans chaque soutenance
      soutenance.teachers = await Promise.all(
        soutenance.teachers.map(async (teacher) => {
          // Si le teacherId correspond, récupérer les informations de l'enseignant
         
            const teacherDetails = await Teacher.findById(teacher.teacherId).select("firstName lastName email");
            
            // Créer un objet avec les détails combinés
            const populatedTeacher = {
              teacherId: teacher.teacherId,
              role: teacher.role,
              firstName: teacherDetails.firstName,
              lastName: teacherDetails.lastName,
              email: teacherDetails.email,
            };
            
            populatedTeachers.push(populatedTeacher); // Ajout de l'enseignant peuplé à la liste
            return populatedTeacher; // Retourner l'enseignant avec les détails ajoutés
          
        })
      );
    }



      // Ajouter les enseignants peuplés à chaque soutenance
      const teacherSoutenancesObj = teacherSoutenances.map((soutenance) => {
        return {
        ...soutenance.toObject(),
        teachers: soutenance.teachers.map((teacher) => {
          return populatedTeachers.find(
          (populatedTeacher) =>
            populatedTeacher.teacherId.toString() === teacher.teacherId.toString()
          );
        }),
        };
      });

      

        const soutenancesAsRapporteur = teacherSoutenancesObj.filter((soutenance) =>
          soutenance.teachers.some(
          (teacher) =>
            teacher.teacherId.toString() === teacherId.toString() &&
            teacher.role === "rapporteur"
          )
        );

        const soutenancesAsPresident = teacherSoutenancesObj.filter((soutenance) =>
          soutenance.teachers.some(
          (teacher) =>
            teacher.teacherId.toString() === teacherId.toString() &&
            teacher.role === "président de jury"
          )
        );
    // Séparer les soutenances par rôle
    const soutenancesAsEncadrant = teacherSoutenancesObj.filter((soutenance) =>
      soutenance.teachers.some(
        (teacher) =>
          teacher.teacherId.toString() === teacherId.toString() &&
          teacher.role === "encadrant"
      )
    );
    // Construire la réponse
    return res.status(200).json({
      message: "✅ Soutenances récupérées avec succès.",
      data: {
        asEncadrant: soutenancesAsEncadrant,
        asRapporteur: soutenancesAsRapporteur,
        asPresident: soutenancesAsPresident,
      
        
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "❌ Erreur lors de la récupération des soutenances.",
      error: error.message,
    });
  }
};
export const getStudentSoutenances=async(req,res)=>{  

try {
  const studentId = req.auth.userId; // ID de l'étudiant connecté

  // Récupérer toutes les soutenances où l'étudiant est impliqué
  const studentSoutenances = await SoutenancePfe.find({
    students: studentId,
  }).populate("projectId", "title description")
  .populate("teachers.teacherId", "firstName lastName email")
  .select("-academicYear")


  // Construire la réponse
  return res.status(200).json({
    message: "✅ Soutenances récupérées avec succès.",
    data: studentSoutenances,

  });




} catch (error) { 
  console.error(error);
  return res.status(500).json({
    message: "❌ Erreur lors de la récupération des soutenances.",
    error: error.message,
  });
} 
};

