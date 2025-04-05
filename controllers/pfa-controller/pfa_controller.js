import PFA from '../../models/project_models/project_pfa.js'
import PFAValidator from '../../validators/project_pfa_validator.js'
import period_model from '../../models/period-model/period_model.js'
import { sendApprovalEmails } from '../../utils/Send_Pfa_Email.js'
import nodemailer from 'nodemailer'
import Student from '../../models/users-models/student_model.js'
import dotenv from 'dotenv'

dotenv.config()

// --------------- Routes for Teacher -------------------------------

export const fetch_my_pfa = async (req, res) => {
  try {
    // Filtre pour récupérer uniquement les sujets postés par l'enseignant authentifié
    const teacherId = req.auth.userId
    const projects_pfa = await PFA.find({ teacherId: teacherId })

    res.status(200).json({ model: projects_pfa, message: 'Succès' })
  } catch (e) {
    res.status(400).json({ error: e.message, message: "Problème d'accès" })
  }
}

export const add_my_pfa = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      technologies_list,
      numberOfStudents,
      list_of_student, // Peut contenir des emails
      academicYear,
      documentId,
      periodId,
    } = req.body;

    // Validation des données avec Joi (modifiez votre validator pour accepter les emails)
    const { error } = PFAValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Vérification du délai
    const period = await period_model.findOne({
      name: 'Dépôt des Sujet des PFA',
      end_date: { $gte: new Date() },
    });
    if (!period) {
      return res.status(400).json({ message: 'Le délai pour l\'ajout des sujets PFA est dépassé.' });
    }

    // Conversion des emails en IDs
    let studentIds = [];
    if (list_of_student && list_of_student.length > 0) {
      // Vérifier si ce sont des emails (contient @) ou des IDs
      const emails = list_of_student.filter(item => item.includes('@'));
      const potentialIds = list_of_student.filter(item => !item.includes('@'));

      // Trouver les étudiants par email
      const students = await Student.find({ email: { $in: emails } });

      // Vérifier si tous les emails ont été trouvés
      const foundEmails = students.map(s => s.email);
      const missingEmails = emails.filter(email => !foundEmails.includes(email));

      if (missingEmails.length > 0) {
        return res.status(404).json({
          message: `Étudiants non trouvés: ${missingEmails.join(', ')}`,
        });
      }

      // Vérifier les IDs potentiels
      const existingStudents = await Student.find({
        $or: [
          { _id: { $in: potentialIds } },
          { email: { $in: emails } }
        ]
      });

      studentIds = existingStudents.map(s => s._id);
    }

    // Création du PFA
    const newPFA = new PFA({
      title,
      description,
      type: type || 'PFA', // Valeur par défaut
      technologies_list,
      numberOfStudents,
      list_of_student: studentIds, // Stockage des IDs
      academicYear,
      documentId,
      periodId,
      teacherId: req.auth.userId,
      affected: studentIds.length > 0
    });

    const savedPFA = await newPFA.save();

    // Envoi des emails de confirmation
    if (studentIds.length > 0) {
      const students = await Student.find({ _id: { $in: studentIds } });
      await sendApprovalEmails(students, savedPFA);
    }

    return res.status(201).json({
      message: 'PFA créé avec succès',
      pfa: savedPFA
    });

  } catch (err) {
    console.error('Erreur création PFA:', err);
    return res.status(500).json({
      message: 'Erreur serveur lors de la création du PFA',
      error: err.message
    });
  }
};

export const update_my_pfa = async (req, res) => {
  try {
    // 1. Vérification du délai
    const period = await period_model.findOne({
      name: 'Dépôt des Sujet des PFA',
      end_date: { $gte: new Date() },
    });

    if (!period) {
      return res.status(400).json({
        message: 'Le délai pour la modification des sujets PFA est dépassé.',
      });
    }

    // 2. Vérification de l'existence du PFA
    const existingPfa = await PFA.findById(req.params.id);
    if (!existingPfa) {
      return res.status(404).json({ message: 'Sujet PFA non trouvé.' });
    }

    // 3. Vérification des permissions
    if (existingPfa.teacherId.toString() !== req.auth.userId.toString()) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à modifier ce sujet PFA.",
      });
    }

    // 4. Validation du type de projet
    if (!['Monome', 'Binome'].includes(req.body.numberOfStudents)) {
      return res.status(400).json({
        message: "Le type de projet doit être 'Monome' ou 'Binome'",
      });
    }

    // 5. Vérification des doublons dans la liste d'étudiants
    if (req.body.list_of_student?.length > 0) {
      const uniqueStudents = [...new Set(req.body.list_of_student.map(s => s.toLowerCase()))];
      if (uniqueStudents.length !== req.body.list_of_student.length) {
        const duplicates = req.body.list_of_student.filter((email, index) => 
          req.body.list_of_student.findIndex(
            e => e.toLowerCase() === email.toLowerCase()
          ) !== index
        );
        return res.status(400).json({
          message: `Les emails doivent être uniques. Doublons détectés : ${duplicates.join(', ')}`,
          code: 'DUPLICATE_EMAILS',
          data: {
            duplicates,
            uniqueCount: uniqueStudents.length
          }
        });
      }
    }

    // 6. Traitement des étudiants
    let studentIds = [];
    if (req.body.list_of_student?.length > 0) {
      // Séparation emails/IDs
      const emails = req.body.list_of_student.filter(item => item.includes('@'));
      const ids = req.body.list_of_student.filter(item => !item.includes('@'));

      // Validation emails
      if (emails.length > 0) {
        const emailStudents = await Student.find({ 
          email: { $in: emails.map(e => e.toLowerCase()) } 
        });
        
        if (emailStudents.length !== emails.length) {
          const foundEmails = emailStudents.map(s => s.email.toLowerCase());
          const missing = emails.filter(
            e => !foundEmails.includes(e.toLowerCase())
          );
          return res.status(404).json({
            message: `Étudiants non trouvés (vérifiez les emails) : ${missing.join(', ')}`,
            code: 'STUDENTS_NOT_FOUND'
          });
        }
        studentIds.push(...emailStudents.map(s => s._id));
      }

      // Validation IDs
      if (ids.length > 0) {
        const idStudents = await Student.find({ _id: { $in: ids } });
        if (idStudents.length !== ids.length) {
          const foundIds = idStudents.map(s => s._id.toString());
          const missing = ids.filter(id => !foundIds.includes(id));
          return res.status(404).json({
            message: `IDs étudiants invalides : ${missing.join(', ')}`,
            code: 'INVALID_STUDENT_IDS'
          });
        }
        studentIds.push(...ids);
      }
    }

    // 7. Vérification du nombre max d'étudiants
    const maxStudents = req.body.numberOfStudents === 'Binome' ? 2 : 1;
    if (studentIds.length > maxStudents) {
      return res.status(400).json({
        message: `Un projet ${req.body.numberOfStudents} ne peut avoir que ${maxStudents} étudiant(s)`,
        code: 'TOO_MANY_STUDENTS'
      });
    }

    // 8. Mise à jour du PFA
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      technologies_list: Array.isArray(req.body.technologies_list) 
        ? req.body.technologies_list 
        : req.body.technologies_list?.split(',').map(t => t.trim()),
      numberOfStudents: req.body.numberOfStudents,
      list_of_student: studentIds,
      affected: studentIds.length > 0,
      updatedAt: new Date()
    };

    const updatedPfa = await PFA.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('list_of_student', 'email name');

    // 9. Réponse
    res.status(200).json({
      success: true,
      model: updatedPfa,
      message: 'PFA mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur modification PFA:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la modification',
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

export const delete_my_pfa = async (req, res) => {
  try {
    // Vérification si le délai est dépassé
    const period = await period_model.findOne({
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
    const teacherId = req.auth.userId
    if (project_pfa.teacherId.toString() !== teacherId.toString()) {
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
      .populate('list_of_student')
      .exec()
    // Vérification si le projet existe
    if (!project_pfa) {
      return res.status(404).json({
        message: 'Objet non trouvé',
      })
    }
    // Vérification si l'enseignant authentifié est autorisé à accéder au sujet
    if (project_pfa.teacherId.toString() !== req.auth.userId.toString()) {
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
    const pfas = await PFA.find().populate('teacherId').populate('list_of_student')
    res.status(200).json({ model: pfas, message: 'success ' })
  } catch (e) {
    res.status(400).json({ error: e.message, message: 'access problem' })
  }
}

export const get_pfa_ByID = async (req, res) => {
  try {
    const project_pfa = await PFA.findOne({ _id: req.params.id })
      .populate('list_of_student')
      .populate('teacherId')
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
    const rejected = true;
    const updated_pfa = await PFA.findOneAndUpdate(
      { _id: req.params.id },
      { rejected },
      { new: true }
    ).populate('teacherId'); // <-- Ajoutez cette ligne

    if (!updated_pfa) {
      return res.status(404).json({
        message: 'Sujet PFA non trouvé.',
      });
    }

    return res.status(200).json({
      model: updated_pfa,
      message: "Le champ 'rejected' a été mis à jour avec succès.",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const restaure_pfa = async (req, res) => {
  try {
    const rejected = false;
    const updated_pfa = await PFA.findOneAndUpdate(
      { _id: req.params.id },
      { rejected },
      { new: true }
    ).populate('teacherId'); // <-- Ajoutez cette ligne

    if (!updated_pfa) {
      return res.status(404).json({
        message: 'Sujet PFA non trouvé.',
      });
    }

    return res.status(200).json({
      model: updated_pfa,
      message: "Le champ 'rejected' a été mis à jour avec succès.",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const publish_one_pfa = async (req, res) => {
  try {
    const published= true;
    const updated_pfa = await PFA.findOneAndUpdate(
      { _id: req.params.id },
      { published },
      { new: true }
    ).populate('teacherId'); // <-- Ajoutez cette ligne

    if (!updated_pfa) {
      return res.status(404).json({
        message: 'Sujet PFA non trouvé.',
      });
    }

    return res.status(200).json({
      model: updated_pfa,
      message: "Le champ 'rejected' a été mis à jour avec succès.",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const publish_pfa = async (req, res) => {
  try {
    // Convertir response en booléen
    const response = req.params.response === 'true'
    const { start_date, end_date } = req.body

    if (!response) {
      // Si response=false, masquer tous les PFA
      await PFA.updateMany({}, { published: false })
      return res.status(200).json({
        message: 'Liste des PFA masquée avec succès.',
      })
    } else {
      // Publier les PFA non rejetés
      await PFA.updateMany({ rejected: { $ne: true } }, { published: true })

      // Créer ou mettre à jour une période "Choix de PFA" avec les dates fournies
      if (start_date && end_date) {
        // Cherche ou crée la période avec le nom "Choix sujet PFA"
        const period = await period_model.findOneAndUpdate(
          { name: 'Choix de PFA' },
          { start_date, end_date },
          { upsert: true, new: true },
        )

        return res.status(200).json({
          message:
            'PFA publiés avec succès et période de choix mise à jour ou créée.',
          period,
        })
      }

      return res.status(200).json({
        message: 'PFA publiés avec succès.',
      })
    }
  } catch (error) {
    // Gestion des erreurs serveur
    return res.status(500).json({
      message: 'Erreur serveur.',
      error: error.message,
    })
  }
}

export const send_pfa_list_email = async (req, res) => {
  try {
    // Rechercher les étudiants ayant role="student" et level=2
    const students = await Student.find({ role: 'student', level: '2' })
    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'Aucun étudiant trouvé.' })
    }

    // Vérifier s'il existe au moins un PFA avec send=true
    const pfaSendStatus = await PFA.findOne({ send: true }).exec()
    const isFirstSend = !pfaSendStatus // Si aucun PFA avec send=true, c'est le premier envoi
    // const pfaCount = await PFA.countDocuments()
    // if (pfaCount === 0) {
    //   return res.status(404).json({ message: 'Aucun PFA trouvé.' })
    // }

    // Configurer le transporteur d'email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "benboubakerchiraz054@gmail.com",
        pass: "brqd tlgs naoy rkwe",
      },
    })

    // Contenu du mail
    const htmlContent = generateEmailTemplate(isFirstSend)

    // Envoyer l'email à chaque étudiant
    const emailPromises = students.map((student) => {
      return transporter.sendMail({
        from: '"Équipe PFA" <votre_email@gmail.com>',
        to: student.email, // Adresse email de l'étudiant
        subject: isFirstSend
          ? 'Choix du sujet PFA'
          : 'Mise à jour : Liste des sujets PFA', // Sujet de l'email
        html: htmlContent, // Contenu HTML de l'email
      })
    })

    // Attendre que tous les emails soient envoyés
    await Promise.all(emailPromises)

    // Si c'est le premier envoi, mettre à jour "send" à true pour tous les PFA
    if (isFirstSend) {
      await PFA.updateMany({}, { send: true })
    }

    return res.status(200).json({
      message: `Emails envoyés avec succès (${isFirstSend ? 'premier envoi' : 'mise à jour'}).`,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de l'envoi des emails.",
      error: error.message,
    })
  }
}

// Fonction pour générer le contenu HTML de l'email
const generateEmailTemplate = (isFirstSend) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
      body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f9;
          color: #333;
      }
      .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0);
      }
      .header {
          background-color: #0078d7;
          color: #fff;
          text-align: center;
          padding: 20px;
      }
      .header h1 {
          margin: 0;
          font-size: 1.8rem;
      }
      .content {
          padding: 20px;
          text-align: left;
      }
      .content p {
          margin: 0 0 15px;
          line-height: 1.6;
      }
      .content a {
          color: #0078d7;
          text-decoration: underline;
      }
      .footer {
          background-color: #f4f4f9;
          text-align: center;
          padding: 15px;
          font-size: 0.9rem;
          color: #666;
      }
      .footer img {
          display: block;
          margin: 10px auto;
          width: 65px;
          height: 50px;
      }
      .footer p {
          margin: 5px 0;
      }
    .black {
      color: #000;
    }
  </style>
</head>
<body>
  <div class="email-container">
      <div class="header">
          <h1>${isFirstSend ? 'Choix du sujet PFA' : 'Mise à jour : Liste des sujets PFA'}</h1>
      </div>
      <div class="content">
          <p class="black">Bonjour,</p>
          <p>${
            isFirstSend
              ? 'Une liste complète de sujets PFA vous attend. Veuillez consulter et choisir votre sujet en cliquant sur le lien ci-dessous :'
              : 'La liste des sujets PFA a été mise à jour. Veuillez consulter les nouvelles informations en cliquant sur le lien ci-dessous :'
          }</p>
          <p><a href="http://v1/pfa/list">http://v1/pfa/list</a></p>
          <p>Cordialement,</p>
          <p>L'équipe PFA</p>
      </div>
      <div class="footer">
          <img src="https://isa2m.rnu.tn/assets/img/logo-dark.png" alt="ISAMM Logo">
          <p>&copy; ISAMM PFA Management System</p>
      </div>
  </div>
</body>
</html>`

// ------------------------- Student Controller -------------------------------------
export const fetsh_published_pfa = async (req, res) => {
  try {
    console.log(req.auth)
    // Find pfa with published are true
    const projects_pfa = await PFA.find({ published: true })
      .populate('teacherId')
      .select(
        'teacherId technologies_list title description numberOfStudents affected',
      )
    res.status(200).json({ model: projects_pfa, message: 'Succès' })
  } catch (e) {
    res.status(400).json({ error: e.message, message: "Problème d'accès" })
  }
}

export const get_published_pfa_by_id = async (req, res) => {
  try {
    // Recherche du sujet PFA par ID avec le champ `published` à `true`
    const project_pfa = await PFA.findOne({
      _id: req.params.id,
      published: true,
    })
      .select(
        'teacherId technologies_list title description numberOfStudents affected',
      )
      .exec()
    // Vérification si le projet existe
    if (!project_pfa) {
      return res.status(404).json({
        message: 'Sujet PFA introuvable ou non publié.',
      })
    }
    // Réponse réussie
    res.status(200).json({
      model: project_pfa,
      message: 'Sujet trouvé avec succès.',
    })
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({
      error: error.message,
      message: 'Erreur lors de la récupération du sujet PFA.',
    })
  }
}
