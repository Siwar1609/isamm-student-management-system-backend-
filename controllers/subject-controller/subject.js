import Subject from '../../models/subject-models/subject_model.js'
import subjectValidator from '../../validators/subject_validator.js'
import Joi from 'joi'
import Teacher from '../../models/users-models/teacher_model.js'
import nodemailer from 'nodemailer'
import Student from '../../models/users-models/student_model.js'
import dotenv from 'dotenv'
dotenv.config() // This loads environment variables from the .env file
export const addSubject = async (req, res) => {
  try {
    const { error } = subjectValidator.validate(req.body)

    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      })
    }

    const subject = new Subject(req.body)

    await subject.save()

    // Récupérer les IDs des professeurs (assurez-vous que `teacherId` est un tableau)
    const teacherIds = req.body.teacherId

    if (teacherIds && Array.isArray(teacherIds)) {
      // Parcourir chaque ID de professeur pour mettre à jour leurs `subjects`
      for (const teacherId of teacherIds) {
        const teacher = await Teacher.findById(teacherId)
        if (!teacher) {
          return res.status(404).json({
            message: `Teacher with ID ${teacherId} not found`,
          })
        }
        teacher.subjects.push(subject._id)
        await teacher.save()
      }
    }

    res.status(201).json({
      subject,
      message: 'Subject added successfully',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Failed to add subject',
    })
  }
}

export const updateSubject = async (req, res) => {
  try {
    // Validate the request body using subjectValidator
    const { error } = subjectValidator.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      })
    }

    // Fetch the existing subject from the database
    const existingSubject = await Subject.findById(req.params.id).exec()
    if (!existingSubject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    // Store the previous state in the history
    const historyEntry = {
      modifiedAt: new Date(),
      previousState: {
        title: existingSubject.title,
        description: existingSubject.description,
        level: existingSubject.level,
        semester: existingSubject.semester,
        chapId: existingSubject.chapId,
        teacherId: existingSubject.teacherId,
        skillId: existingSubject.skillId,
        curriculumId: existingSubject.curriculumId,
        academicYearId: existingSubject.academicYearId,
      },
    }

    // Add the history entry to the subject's history array
    existingSubject.history = [...(existingSubject.history || []), historyEntry]

    // Apply the updates from the request body to the existing subject
    const updatedFields = req.body
    for (const key in updatedFields) {
      if (key in existingSubject) {
        existingSubject[key] = updatedFields[key]
      }
    }

    // Handle updating teacher associations (teacherId)
    const newTeacherIds = req.body.teacherId // New teacher IDs from the request
    if (newTeacherIds && Array.isArray(newTeacherIds)) {
      const oldTeachers = await Teacher.find({ subjects: existingSubject._id })

      // Remove the subject from teachers who are no longer associated
      for (const oldTeacher of oldTeachers) {
        if (!newTeacherIds.includes(oldTeacher._id.toString())) {
          oldTeacher.subjects.pull(existingSubject._id) // Remove subject from teacher
          await oldTeacher.save()
        }
      }

      // Add the subject to new teachers
      for (const newTeacherId of newTeacherIds) {
        const newTeacher = await Teacher.findById(newTeacherId)
        if (!newTeacher) {
          return res
            .status(404)
            .json({ message: `Teacher with ID ${newTeacherId} not found` })
        }

        if (!newTeacher.subjects.includes(existingSubject._id)) {
          newTeacher.subjects.push(existingSubject._id)
          await newTeacher.save()
        }
      }
    }

    // Save the updated subject document
    await existingSubject.save()

    // Return the updated subject and its history
    res.status(200).json({
      subject: existingSubject,
      message: 'Subject updated successfully with history recorded',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
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
  const { raisonDuChangement, skillId, title, ...autresInfos } = req.body

  // Check if title or skillId is being updated
  if (title !== undefined) {
    return res
      .status(400)
      .json({ message: 'The title cannot be modified !' })
  }
  if (skillId !== undefined) {
    return res
      .status(400)
      .json({ message: 'Skills cannot be modified !.' })
  }

  try {
    // Vérification de l'existence de la matière
    const subject = await Subject.findById(id)
    if (!subject) {
      return res.status(404).json({ message: 'Subject not Found' })
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
        raisonDuChangement,
        propositionValidated: false, // Par défaut, non validé
      },
    }

    // Ajout de la nouvelle entrée d'historique
    subject.history.push(nouvelleHistoriqueEntry)

    // Sauvegarde des modifications
    await subject.save()

    return res
      .status(200)
      .json({
        message: 'Proposition added successfully',
        historique: nouvelleHistoriqueEntry,
      })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: "Error while adding the proposition" })
  }
}
export const validateProposition = async (req, res) => {
  const id = req.params.id;

  try {
    // Récupérer la matière par ID
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Afficher l'historique pour le débogage
    console.log('History Array:', JSON.stringify(subject.history, null, 2));

    // Trouver la dernière proposition non validée
    const lastPropositionIndex = subject.history.findIndex(
      (entry) =>
        entry.proposedState && entry.proposedState.propositionValidated === false
    );

    if (lastPropositionIndex === -1) {
      return res.status(400).json({ message: 'No unvalidated proposal found.' });
    }

    // Récupérer la proposition non validée
    const lastProposition = subject.history[lastPropositionIndex];

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
    };

    // Appliquer les changements proposés au sujet
    Object.assign(subject, lastProposition.proposedState);

    // Marquer la proposition comme validée
    subject.history[lastPropositionIndex].proposedState.propositionValidated = true;

    // Ajouter l'ancien état dans l'historique
    subject.history.push({
      modifiedAt: new Date(),
      previousState,
    });

    // Sauvegarder les modifications
    await subject.save();

    return res.status(200).json({
      message: 'Proposition validated successfully',
      subject,
    });
  } catch (error) {
    console.error('Error in validateProposition:', error);
    return res.status(500).json({ message: 'Error while validating the proposition' });
  }
};




export const sendEvaluationEmail = async (req, res) => {
  try {
    const { id } = req.body // Subject ID from the request body

    // Retrieve the subject and its associated students
    const subject = await Subject.findById(id).populate('studentId')
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' })
    }

    // Get the email addresses of all students
    const studentEmails = subject.studentId.map((student) => student.email)

    // Ensure there are students enrolled
    if (studentEmails.length === 0) {
      return res
        .status(400)
        .json({ message: 'No students are enrolled in this subject.' })
    }

    // Configure the email transporter with Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'benboubakerchiraz054@gmail.com',
        pass: 'brqd tlgs naoy rkwe',
      },
    })

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmails,
      subject: `Évaluation du cours: ${subject.title}`,
      text: `Bonjour, nous vous invitons à remplir le formulaire d'évaluation pour le cours "${subject.title}". Veuillez cliquer sur le lien suivant pour accéder au formulaire: \n\n http://your-site.com/evaluation?subjectId=${subject._id}`,
      html: `
        <p>Bonjour,</p>
        <p>Nous vous invitons à remplir le formulaire d'évaluation pour le cours <strong>"${subject.title}"</strong>.</p>
        <p>Veuillez cliquer sur le lien ci-dessous pour accéder au formulaire d'évaluation :</p>
        <a href="http://your-site.com/evaluation?subjectId=${subject._id}" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; font-size: 16px;">Accédez au formulaire</a>
        <p>Merci pour vos retours !</p>
      `,
    }

    // Send the email
    await transporter.sendMail(mailOptions)
    console.log('Email sent successfully')

    // Respond with success
    res.status(200).json({ message: 'Emails evaluation sent successfully.' })
  } catch (error) {
    console.error('Error sending evaluation emails:', error)
    res
      .status(500)
      .json({ error: 'An error occurred while sending evaluation emails.' })
  }
}
