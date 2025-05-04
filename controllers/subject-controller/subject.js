import Subject from '../../models/subject-models/subject_model.js'
import subjectValidator from '../../validators/subject_validator.js'
import Joi from 'joi'
import Teacher from '../../models/users-models/teacher_model.js'
import nodemailer from 'nodemailer'
import Student from '../../models/users-models/student_model.js'
import Curriculum from '../../models/subject-models/curriculum_model.js' // Adjust the path as necessary

import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config() // This loads environment variables from the .env file
export const addSubject = async (req, res) => {
  try {
    const { error } = subjectValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const subject = new Subject(req.body);
    await subject.save();

    // Gestion de l'association avec l'enseignant
    if (req.body.teacherId) {
      const teacher = await Teacher.findById(req.body.teacherId);
      if (!teacher) {
        return res.status(404).json({
          message: `Enseignant avec ID ${req.body.teacherId} non trouvé`,
        });
      }

      // Ajouter la matière à la liste des matières de l'enseignant
      teacher.subjects.push(subject._id);
      await teacher.save();
    }

    res.status(201).json({
      subject,
      message: 'Matière ajoutée avec succès',
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: error.message,
      message: 'Échec de l\'ajout de la matière',
    });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { error } = subjectValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingSubject = await Subject.findById(req.params.id);
    if (!existingSubject) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }

    // Historique des modifications
    const historyEntry = {
      modifiedAt: new Date(),
      previousState: {
        ...existingSubject.toObject(),
      },
    };

    // Nouvel ID enseignant venant de la requête
    const newTeacherId = req.body.teacherId;
    const oldTeacherId = existingSubject.teacherId;

    // Mise à jour des champs de la matière
    Object.assign(existingSubject, req.body);
    existingSubject.history = [...(existingSubject.history || []), historyEntry];

    // Gestion du changement d'enseignant
    if (newTeacherId !== oldTeacherId) {
      // Retirer la matière de l'ancien enseignant
      if (oldTeacherId) {
        const oldTeacher = await Teacher.findById(oldTeacherId);
        if (oldTeacher) {
          oldTeacher.subjects.pull(existingSubject._id);
          await oldTeacher.save();
        }
      }

      // Ajouter la matière au nouvel enseignant
      if (newTeacherId) {
        const newTeacher = await Teacher.findById(newTeacherId);
        if (!newTeacher) {
          return res.status(404).json({
            message: `Enseignant avec ID ${newTeacherId} non trouvé`,
          });
        }

        if (!newTeacher.subjects.includes(existingSubject._id)) {
          newTeacher.subjects.push(existingSubject._id);
          await newTeacher.save();
        }
      }
    }

    await existingSubject.save();

    res.status(200).json({
      subject: existingSubject,
      message: 'Matière mise à jour avec succès',
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id)

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    res.status(200).json({
      model: subject,
      message: 'Subject Deleted',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const fetchSubjects = async (req, res) => {
  try {
    // Récupérer le rôle de l'utilisateur et son ID
    const userRole = req.auth.role
    const userId = req.auth.userId // ID de l'utilisateur connecté

    let filter = {}

    if (userRole === 'admin') {
      // L'admin peut voir toutes les matières, publiées ou non
      filter = {}
    } else if (userRole === 'teacher') {
      // L'enseignant ne voit que ses matières publiées
      filter = { teacherId: userId, published: true }
    } else if (userRole === 'student') {
      // L'étudiant ne voit que ses matières publiées
      filter = { studentId: userId, published: true }
    } else {
      return res.status(403).json({
        message: 'Access Denied',
      })
    }

    // Récupérer les matières en fonction du filtre et peupler le champ teacherId
    const subjects = await Subject.find(filter)
      .populate('teacherId') // Populate teacherId to get teacher details
      .exec()

    res.status(200).json({
      model: subjects,
      message: 'Subjects Fetched Successfully',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Error fetching subjects',
    })
  }
}

export const getSubjectbyID = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id })
      .populate('chapId')
      .populate('skillId')
      .populate('curriculumId')
      .populate('teacherId')
      .populate('studentId')
      .exec()

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    // Only send the 'subject' model which contains the 'history'
    res.status(200).json({
      model: subject, // This already includes the 'history' field
      message: 'Subject found',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Publish a subject

export const togglePublishSubject = async (req, res) => {
  try {
    const { response } = req.params // Get the "response" parameter (publish or unpublish)
    const { id } = req.body // Assume the ID of the subject comes in the request body (you can modify this if needed)

    // Validate if response is either "publish" or "unpublish"
    if (response !== 'publish' && response !== 'unpublish') {
      return res.status(400).json({ message: 'Invalid response parameter' })
    }

    // Find the subject by ID
    const subject = await Subject.findById(id)

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    // Publish or unpublish the subject based on the response parameter
    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { published: response === 'publish' },
      { new: true },
    )

    // Return a success message with the updated subject
    res.status(200).json({
      subject: updatedSubject,
      message: `Subject ${response === 'publish' ? 'published' : 'unpublished'} successfully`,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

/**
 * Ajoute une proposition à l'historique d'une matière.
 * @param {Object} req - L'objet de requête contenant les informations nécessaires.
 * @param {Object} res - L'objet de réponse pour envoyer des réponses au client.
 */

/**
 * Ajoute une proposition à l'historique d'une matière.
 * @param {Object} req - L'objet de requête contenant les informations nécessaires.
 * @param {Object} res - L'objet de réponse pour envoyer des réponses au client.
 */

export const addProposition = async (req, res) => {
  const id = req.params.id
  const { REASON, skillId, title, curriculumId, ...autresInfos } = req.body

  // Vérification si le champ title ou skillId est modifié
  if (title !== undefined) {
    return res.status(400).json({ message: 'The title cannot be modified!' })
  }
  if (skillId !== undefined) {
    return res.status(400).json({ message: 'Skills cannot be modified!' })
  }

  if (!REASON || REASON.trim() === '') {
    return res
      .status(400)
      .json({ message: 'The reason for the proposition is required!' })
  }

  try {
    // Vérification de l'existence de la matière
    const subject = await Subject.findById(id)
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    // Vérification de l'existence du curriculum si curriculumId est fourni
    let curriculum
    if (curriculumId) {
      curriculum = await Curriculum.findById(curriculumId)
      if (!curriculum) {
        return res.status(404).json({ message: 'Curriculum not found' })
      }
    }

    // Création de la nouvelle entrée d'historique
    const nouvelleHistoriqueEntry = {
      modifiedAt: new Date(),
      previousState: {
        title: subject.title, // Capture current title
        description: subject.description,
        level: subject.level,
        semester: subject.semester,
        chapId: subject.chapId,
        teacherId: subject.teacherId,
        skillId: subject.skillId, // Capture current skillId
        Assesment_Id: subject.Assesment_Id,
        published: subject.published,
        academicYearId: subject.academicYearId,
        curriculumId: subject.curriculumId,
        studentId: subject.studentId,
      },
      proposedState: {
        ...autresInfos,
        REASON, // Ajouter la raison de la proposition ici
        propositionValidated: false, // Par défaut, non validé
      },
    }

    // Ajout de la nouvelle entrée d'historique
    subject.history.push(nouvelleHistoriqueEntry)

    // Appliquer les modifications au modèle Curriculum si curriculumId est fourni
    if (curriculum) {
      Object.assign(curriculum, autresInfos) // Appliquer toutes les modifications fournies dans autresInfos

      // Sauvegarder les modifications du curriculum
      await curriculum.save()

      // Mettre à jour le curriculumId du sujet si nécessaire
      subject.curriculumId = curriculum._id
    }

    // Sauvegarde des modifications du sujet (sans changer réellement les données)
    await subject.save()

    return res.status(200).json({
      message: 'Proposition added successfully',
      historique: nouvelleHistoriqueEntry,
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: 'Error while adding the proposition' })
  }
}

export const validateProposition = async (req, res) => {
  const id = req.params.id

  try {
    // Récupérer la matière par ID
    const subject = await Subject.findById(id)
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    // Afficher l'historique pour le débogage
    console.log('History Array:', JSON.stringify(subject.history, null, 2))

    // Trouver la dernière proposition non validée
    const lastPropositionIndex = subject.history.findIndex(
      (entry) =>
        entry.proposedState &&
        entry.proposedState.propositionValidated === false,
    )

    if (lastPropositionIndex === -1) {
      return res.status(400).json({ message: 'No unvalidated proposal found.' })
    }

    // Récupérer la proposition non validée
    const lastProposition = subject.history[lastPropositionIndex]

    // Sauvegarder l'état actuel comme ancien état
    const previousState = {
      title: subject.title,
      description: subject.description,
      level: subject.level,
      semester: subject.semester,
      chapId: subject.chapId,
      teacherId: subject.teacherId,
      skillId: subject.skillId,
      Assesment_Id: subject.Assesment_Id,
      published: subject.published,
      academicYearId: subject.academicYearId,
      curriculumId: subject.curriculumId,
      studentId: subject.studentId,
    }

    // Appliquer les changements proposés au sujet
    Object.assign(subject, lastProposition.proposedState)

    // Marquer la proposition comme validée
    subject.history[lastPropositionIndex].proposedState.propositionValidated =
      true

    // Ajouter l'ancien état dans l'historique
    subject.history.push({
      modifiedAt: new Date(),
      previousState,
    })

    // Sauvegarder les modifications
    await subject.save()

    return res.status(200).json({
      message: 'Proposition validated successfully',
      subject,
    })
  } catch (error) {
    console.error('Error in validateProposition:', error)
    return res
      .status(500)
      .json({ message: 'Error while validating the proposition' })
  }
}

export const sendEvaluationEmail = async (req, res) => {
  try {
    const { id } = req.body; // Subject ID from the request body

    // Retrieve the subject and its associated students
    const subject = await Subject.findById(id).populate('studentId');
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    // Get the email addresses and names of all students
    const students = subject.studentId;
    const studentEmails = students.map((student) => student.email);

    // Ensure there are students enrolled
    if (studentEmails.length === 0) {
      return res
        .status(400)
        .json({ message: 'No students are enrolled in this subject.' });
    }

    // Configure the email transporter with Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'benboubakerchiraz054@gmail.com',
        pass: 'brqd tlgs naoy rkwe',
      },
    });

    // Iterate through students and send personalized emails
    for (const student of students) {
      const studentFullName = student.name || 'Student';

      // Email content using your HTML template
      const emailHtml = `
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
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
            display: inline-block;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 16px;
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
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Évaluation du cours: ${subject.title}</h1>
          </div>
          <div class="content">
            <p>Bonjour ${studentFullName},</p>
            <p>Nous vous invitons à remplir le formulaire d'évaluation pour le cours <strong>"${subject.title}"</strong>.</p>
            <p>Veuillez cliquer sur le lien ci-dessous pour accéder au formulaire d'évaluation :</p>
            <a href="http://your-site.com/evaluation?subjectId=${subject._id}">Accédez au formulaire</a>
            <p>Merci pour vos retours !</p>
          </div>
          <div class="footer">
            <img src="https://isa2m.rnu.tn/assets/img/logo-dark.png" alt="ISAMM Logo">
            <p>&copy; ISAMM Subjects Management System</p>
          </div>
        </div>
      </body>
      </html>`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: `Évaluation du cours: ${subject.title}`,
        html: emailHtml,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
    }

    console.log('Emails sent successfully');
    res.status(200).json({ message: 'Evaluation emails sent successfully.' });
  } catch (error) {
    console.error('Error sending evaluation emails:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while sending evaluation emails.' });
  }
};


// Assure-toi que le chemin est correct

export const getSubjectsByTeacher = async (req, res) => {
    try {
        // Récupérer l'ID du professeur depuis les paramètres de l'URL
        const teacherId = req.params.teacherId;

        // Vérification si l'ID du professeur est valide
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({ message: "Invalid teacher ID" });
        }

        // Recherche des matières pour le professeur donné
        const subjects = await Subject.find({
            teacherId: teacherId
        }).populate('teacherId'); // On popul les informations du professeur

        // Si aucune matière n'est trouvée pour ce professeur
        if (!subjects || subjects.length === 0) {
            return res.status(404).json({
                message: "No subjects found for this teacher",
                model: []
            });
        }

        // Si des matières sont trouvées, on les retourne
        res.json({
            model: subjects
        });

    } catch (error) {
        console.error("Error in getSubjectsByTeacher:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
