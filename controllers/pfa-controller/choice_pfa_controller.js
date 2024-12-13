import Student from '../../models/users-models/student_model.js'
import choice_pfa from '../../models/project_models/choice_pfa.js'
import validateChoicePFA from '../../validators/choice_pfa_validator.js'
import PFA from '../../models/project_models/project_pfa.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import period_model from '../../models/period-model/period_model.js'
dotenv.config()

export const choose_pfa = async (req, res) => {
  try {
    const { priority, binomeId, approval } = req.body
    const projectId = req.params.id // L'ID du projet
    const authenticatedStudentId = req.auth.userId // L'ID de l'étudiant authentifié
    // const authenticatedStudent = await Student.findById(authenticatedStudentId).exec();
    // if (!authenticatedStudent || authenticatedStudent.level !== "2") {
    //   return res.status(403).json({ message: "Vous n'êtes pas autorisé à choisir ce sujet." });
    // }

    // Vérification si le délai est dépassé pour le choix de sujet
    const period = await period_model.findOne({
      name: 'Choix de PFA', // Nom de la période
      end_date: { $gte: new Date() },
    })
    if (!period) {
      return res.status(400).json({
        message: 'Le délai pour le choix du sujet PFA est dépassé.',
      })
    }
    // Valider les données
    const { error } = validateChoicePFA.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }
    // Vérifier si le sujet PFA existe et est publié
    const pfa = await PFA.findOne({ _id: projectId, published: true }).exec()
    if (!pfa) {
      return res
        .status(404)
        .json({ message: 'Sujet PFA introuvable ou non publié.' })
    }
    // Vérifier si le sujet est déjà affecté définitivement
    if (pfa.affected) {
      return res
        .status(400)
        .json({ message: 'Ce sujet a déjà été affecté définitivement.' })
    }
    // Vérifier si un choix existe déjà avec la même priorité pour l'étudiant ou le binôme
    const existingChoice = await choice_pfa
      .findOne({
        priority,
        studentList: { $in: [authenticatedStudentId, binomeId] },
      })
      .exec()
    if (existingChoice) {
      return res
        .status(400)
        .json({ message: 'Un choix existe déjà avec cette priorité.' })
    }
    // Si un binôme est fourni, vérifier les conditions pour un binôme
    const studentList = [authenticatedStudentId] // Ajouter l'étudiant authentifié
    if (binomeId) {
      // Vérifier si le binôme est valide
      const binome = await Student.findById(binomeId).exec()
      if (!binome) {
        return res
          .status(404)
          .json({ message: 'Le binôme spécifié est introuvable.' })
      }
      // Vérifier que le sujet est configuré pour binôme
      if (pfa.numberOfStudents !== 'Binome') {
        return res.status(400).json({
          message: 'Ce sujet ne permet pas de configuration en binôme.',
        })
      }
      studentList.push(binomeId)
    }
    // Créer le choix PFA
    const newChoice = await choice_pfa.create({
      projectId,
      priority,
      numberOfStudents: pfa.numberOfStudents,
      studentList,
      approval: approval || false, // Par défaut `false` si non spécifié
    })
    res.status(201).json({
      message: 'Choix du sujet effectué avec succès.',
      data: newChoice,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Erreur lors de la sélection du sujet PFA.',
    })
  }
}
export const getChoicesForProject = async (req, res) => {
  try {
    const { projectId } = req.params // ID du projet passé en paramètre
    // Recherche du projet PFA pour vérifier son existence
    const project = await PFA.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Projet PFA introuvable.' })
    }
    // Vérification que l'enseignant est bien propriétaire du projet
    if (project.teacherId.toString() !== req.auth.userId.toString()) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à accéder à ce projet." })
    }
    // Recherche des choix liés au projet
    const choices = await choice_pfa
      .find({ projectId })
      .populate('studentList', 'name email')
    if (choices.length === 0) {
      return res
        .status(404)
        .json({ message: 'Aucun choix trouvé pour ce projet.' })
    }
    res.status(200).json({
      message: 'Liste des choix pour le projet récupérée avec succès.',
      data: choices,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la récupération des choix.',
      error: error.message,
    })
  }
}
// Pour que l'enseignant choisit l'étudiant concerné , il l'intègre directement dans l route deja faite en 2.2 ,
//          ou bien il le choisit en consultant la liste des choix et puis lui assigné approval : true et l'attribut à lui meme

export const approveChoicePFA = async (req, res) => {
  try {
    const { projectId, choiceId } = req.params // ID du projet et du choix à approuver
    // Recherche du projet PFA posté par l'enseignant
    const pfa = await PFA.findById(projectId)
    if (!pfa) {
      return res.status(404).json({ message: 'Projet PFA introuvable.' })
    }
    // Vérification que l'enseignant est propriétaire du projet
    if (pfa.teacherId.toString() !== req.auth.userId.toString()) {
      return res.status(403).json({ message: 'Accès refusé au projet PFA.' })
    }
    // Recherche du choix PFA associé au projet
    const choice = await choice_pfa.findById(choiceId).populate('studentList') // Jointure avec la liste des étudiants
    if (!choice || choice.projectId.toString() !== projectId) {
      return res
        .status(404)
        .json({ message: 'Choix PFA introuvable ou non lié au projet.' })
    }
    // Vérification si le choix a déjà été approuvé
    if (choice.approval) {
      return res.status(400).json({ message: 'Ce choix a déjà été approuvé.' })
    }
    // Mise à jour de l'approbation
    choice.approval = true
    await choice.save()

    // Filtrer les étudiants à ajouter (on vérifie si l'ID existe déjà)
    const studentsToAdd = choice.studentList.map((student) => student._id)
    const studentsAlreadyInPfa = pfa.list_of_student
    // Ajouter les étudiants s'ils n'existent pas déjà dans la liste
    studentsToAdd.forEach((studentId) => {
      if (!studentsAlreadyInPfa.includes(studentId)) {
        pfa.list_of_student.push(studentId)
      }
    })

    pfa.affected = true
    await pfa.save()
    // Envoi des emails aux étudiants concernés
    const studentEmails = choice.studentList.map((student) => student.email)
    sendApprovalEmails(studentEmails, pfa)
    res.status(200).json({
      message: 'Choix approuvé et étudiants notifiés.',
      data: choice,
    })
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'approbation.", error: error.message })
  }
}
export const sendApprovalEmails = async (emails, pfa) => {
  try {
    // Configurer le transporteur d'emails avec Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
    // Contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails,
      subject: `Votre choix PFA a été approuvé`,
      text: `Félicitations, votre choix pour le projet "${pfa.title}" a été approuvé. Vous êtes désormais affecté à ce projet.`,
    }
    // Envoi de l'email
    await transporter.sendMail(mailOptions)
    console.log('Emails envoyés avec succès.')
  } catch (error) {
    console.error("Erreur lors de l'envoi des emails : ", error.message)
  }
}

export const InformApproval = async (req, res) => {
  try {
    const { choiceId } = req.params

    // Vérification que l'étudiant est bien dans la liste des étudiants de ce choix
    const choice = await choice_pfa.findById(choiceId) // On charge aussi la liste des étudiants
    if (!choice) {
      return res.status(404).json({ message: 'Choix PFA introuvable.' })
    }

    // Vérifier si l'étudiant fait bien partie de la liste des étudiants pour ce choix
    const studentId = req.auth.userId // L'ID de l'étudiant connecté
    if (
      !choice.studentList.some(
        (student) => student._id.toString() === studentId.toString(),
      )
    ) {
      return res.status(403).json({
        message:
          "Vous n'êtes pas autorisé à demander l'approbation pour ce choix.",
      })
    }

    // Vérifier si le choix a déjà été approuvé
    if (choice.approval) {
      return res.status(400).json({ message: 'Ce choix a déjà été approuvé.' })
    }

    // Mise à jour du champ 'approved' à true pour indiquer que l'enseignant a confirmé
    choice.approval = true
    await choice.save()

    // Retourner une réponse de succès
    res.status(200).json({
      message: "Déclaration d'acceptation de d'enseignant envoyée avec succès.",
      data: choice,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message:
        "Erreur lors de l'envoi de déclaration d'acceptation de d'enseignan.",
      error: error.message,
    })
  }
}
