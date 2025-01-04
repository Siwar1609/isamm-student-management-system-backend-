import Student from '../../models/users-models/student_model.js'
import choice_pfa from '../../models/project_models/choice_pfa.js'
import validateChoicePFA from '../../validators/choice_pfa_validator.js'
import PFA from '../../models/project_models/project_pfa.js'

import Teacher from '../../models/users-models/teacher_model.js';

import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { response } from 'express';


dotenv.config()

export const choose_pfa = async (req, res) => {
  try {
    const { priority, binomeId, approval } = req.body
    const projectId = req.params.id // L'ID du projet
    const authenticatedStudentId = req.auth._id // L'ID de l'étudiant authentifié
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
    if (project.teacherId.toString() !== req.auth._id.toString()) {
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
    res
      .status(500)
      .json({
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
    if (pfa.teacherId.toString() !== req.auth._id.toString()) {
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
    // Ajout des étudiants à la liste des étudiants du PFA
    pfa.list_of_student.push(
      ...choice.studentList.map((student) => student._id),
    )
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

//___________________________________________________done_________________________________________________________________
export const fetchStudentChoices = async (req, res) => {
  try {
    // Fetch all student choices with their project and student details
    const studentChoices = await choice_pfa.find({studentList:req.params.id})

    if (!studentChoices || studentChoices.length === 0) {
      return res.status(404).json({ message: 'No student foud with such id ' });
    }

    res.status(200).json({ choices: studentChoices });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student choices', error });
  }
};
// ---------------------------
// affected :true |false 
// approved : true |


export const autoAllocatePFA = async (req, res) => {
  try {
    // First algorithm use case
    // Step 1: Find all PFAs where affected === true
    let approvedPFAs = await PFA.find({ affected: true });

    // From approvedPFAs, find all choice_pfa where projectId matches and validate === false
    console.log(approvedPFAs)
    approvedPFAs = await choice_pfa.find({ 
      projectId: { $in: approvedPFAs.map((pfa) => pfa.id) }, 
      approval: true 
    });

    if (approvedPFAs.length === 0) {
      return res.status(400).json({ message: 'No PFAs found with affected === true and approval === true.' });
    }

    // Step 2: Update related ChoicePFA documents
    const updatePromises = approvedPFAs.map((pfa) =>
      choice_pfa.updateMany(
        { _id: pfa.id }, // Match ChoicePFA by projectId
        { validate: true } // Set validate to true
      )
    );

    await Promise.all(updatePromises);

    // Second algorithm use case
    // Fetch choice_pfa where priority === 1 and validate === false
    let priorityPFAs = await choice_pfa.find({ validate: false, priority: 1 });
    console.log(priorityPFAs);

    for (const pfa of priorityPFAs) {
      let nonMultiplePriorities = true;
      for (const choice of priorityPFAs) {
        if (choice.projectId.toString() === pfa.projectId.toString() && choice._id.toString() !== pfa._id.toString()) {
          nonMultiplePriorities = false;
          break;
        }
      }
      if (nonMultiplePriorities) {
        pfa.validate = true;
        await pfa.save();
        console.log(pfa);
      }
    }

    let nonapprovedPFAs = await PFA.find({ affected: false });
    console.log(nonapprovedPFAs);
    nonapprovedPFAs = await choice_pfa.find({ 
      projectId: { $in: nonapprovedPFAs.map((pfa) => pfa.id) }, 
      approval: true 
    });

    // Return success response with the list of approvedPFAs
    res.status(200).json({ 
      message: 'Automatic allocation completed successfully', 
      approvedPFAs 
    });

  } catch (error) {
    res.status(500).json({ message: 'Error during automatic allocation', error });
  }
};

 //___________________________________________done_____________________________________________________________________________________
 export const manualAssignPFA = async (req, res) => {
  //{array,id }
  const { studentIds, pfaId } = req.body;

  try {
    // Step 1: body input check :
      // empty array input 
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        message: 'Please provide at least one student ID.',
      });
    }
        // more than 2 students list :
    if (studentIds.length > 2) {
      return res.status(400).json({
        message: 'A PFA can only be assigned to a maximum of two students.',
      });
    }

    const students = await Student.find({ _id: { $in: studentIds } });
    const pfa = await PFA.findById(pfaId);
      // invalid pfa id :
    if (!pfa) {
      return res.status(404).json({ message: 'PFA not found. Please verify the PFA ID.' });
    }

    // incompatible number of student 
    if (students.length !== studentIds.length) {
      return res.status(404).json({ message: 'One or more students not found. Please verify the IDs.' });
    }

    if (!students || !pfa) {
      return res.status(404).json({
        message: 'Student or PFA not found. Please verify the IDs provided.',
      });
    }

    // Step 2: Check if the PFA is already assigned
    if (pfa.affected) {
      return res.status(400).json({
        message: 'This PFA has already been assigned to another student.',
      });
    }
    // compatible number of students check :
    if (pfa.numberOfStudents === 'Monome' && studentIds.length !== 1) {
      return res.status(400).json({
        message: 'This PFA requiressingle student (Monome).',
      });
    }

    if (pfa.numberOfStudents === 'Binome' && studentIds.length !== 2) {
      return res.status(400).json({
        message: 'This PFA requires two students (Binome).',
      });
    }

    // Step 3: Assign the PFA to the student
    pfa.affected = true;
    pfa.approval = true;
    pfa.list_of_student = studentIds; 
    await pfa.save();

    res.status(200).json({
      message: 'PFA successfully assigned to the student.',
      pfa: {
        title: pfa.title,
        student: studentIds,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error during manual assignment',
      error,
    });
  }
};

//_______________________________________done____________________________________________________________________________________
export const togglePublishPFA = async (req, res) => {
  const { id } = req.params;
  const { publish } = req.body; // Boolean value to either publish (true) or unpublish (false)

  try {
    // Step 1: Find the PFA by ID
    const pfa = await PFA.findById(id);

    if (!pfa  ) {
      return res.status(404).json({ message: 'PFA not found.' });
    }
    
    // Step 2: Update the `published` status
    pfa.published = !pfa.published;

    await pfa.save();

    res.status(200).json({
      message: `PFA successfully updated .`,
      pfa: {
        title: pfa.title,
        published: pfa.published,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling publish status', error });
  }
};

//------------------------


export const sendEmailToRecipients = async (req, res) => {

  try {
    let recipients = [];
// we will get from here the teachers emails and push them in the recipients array
const valid_pfa = await PFA.find({ affected: true }).populate("teacherId");

recipients.push(...valid_pfa.map((pfa) => pfa.teacherId.email));

// now we will get the students ids then we will get the students emails 
let ids = [];
for (let i = 0; i < valid_pfa.length; i++) {
  for (let j = 0; j < valid_pfa[i].list_of_student.length; j++) {
    ids.push(valid_pfa[i].list_of_student[j]._id);
  }
}
const students = await Student.find({ _id: { $in: ids } });
recipients.push(...students.map((student) => student.email));
// we will remove the duplicates using this SET
recipients = [...new Set(recipients)];
console.log("all recipients" , recipients);
    
    // Step 2: Configure Nodemailer transporter
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "ahmedgafsi88@gmail.com",
      subject:"hhh",
      html: "this oggg",
    })

     const pfaSendStatus = await PFA.findOne({ send: true }).select('send')
    const isFirstSend = !pfaSendStatus  // Si aucun PFA avec send=true, c'est le premier envoi

     if (!pfaSendStatus) {
          return res.status(404).json({ message: 'Aucun PFA trouvé.' })
        }
    
        
    
        // Contenu du mail selon le type d'envoi
        const subject = isFirstSend
          ? 'Choix du sujet PFA'
          : 'Mise à jour : Liste des sujets PFA'
    
        const htmlContent = isFirstSend
          ? `
            <p>Bonjour,</p>
            <p>Une liste complète de sujets PFA vous attend. Veuillez consulter et choisir votre sujet en cliquant sur le lien ci-dessous :</p>
            <a href="http://v1/pfa/list">Voir la liste des sujets PFA</a>
            <p>Cordialement,</p>
            <p>L'équipe PFA</p>
          `
          : `
            <p>Bonjour,</p>
            <p>La liste des sujets PFA a été mise à jour. Veuillez consulter les nouvelles informations en cliquant sur le lien ci-dessous :</p>
            <a href="http://v1/pfa/list">Voir la liste mise à jour des sujets PFA</a>
            <p>Cordialement,</p>
            <p>L'équipe PFA</p>
          `
    
        // Envoyer l'email à chaque étudiant
        const emailPromises = students.map((student) => {
          return transporter.sendMail({
            from: '"Équipe PFA" <votre_email@gmail.com>',
            to: student.email, // Adresse email de l'étudiant
            subject, // Sujet de l'email
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
    res.status(500).json({ message: 'Error sending email', error });
  }
};


























//###################################################################################################
export const send_pfa_list_email = async (req, res) => {
  try {
    // Rechercher les étudiants ayant role="student" et level=2
    const students = await Student.find({ role: 'student', level: '2' })
    console.log(students)
    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'Aucun étudiant trouvé.' })
    }

    // Vérifier s'il existe au moins un PFA avec send=true
    const pfaSendStatus = await PFA.findOne({ send: true }).select('send')
    const isFirstSend = !pfaSendStatus  // Si aucun PFA avec send=true, c'est le premier envoi

    if (!pfaSendStatus) {
      return res.status(404).json({ message: 'Aucun PFA trouvé.' })
    }

    // Configurer le transporteur d'email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        // user: 'benboubakerchiraz054@gmail.com',
        // pass: 'brqd tlgs naoy rkwe',
      },
    })

    // Contenu du mail selon le type d'envoi
    const subject = isFirstSend
      ? 'Choix du sujet PFA'
      : 'Mise à jour : Liste des sujets PFA'

    const htmlContent = isFirstSend
      ? `
        <p>Bonjour,</p>
        <p>Une liste complète de sujets PFA vous attend. Veuillez consulter et choisir votre sujet en cliquant sur le lien ci-dessous :</p>
        <a href="http://v1/pfa/list">Voir la liste des sujets PFA</a>
        <p>Cordialement,</p>
        <p>L'équipe PFA</p>
      `
      : `
        <p>Bonjour,</p>
        <p>La liste des sujets PFA a été mise à jour. Veuillez consulter les nouvelles informations en cliquant sur le lien ci-dessous :</p>
        <a href="http://v1/pfa/list">Voir la liste mise à jour des sujets PFA</a>
        <p>Cordialement,</p>
        <p>L'équipe PFA</p>
      `

    // Envoyer l'email à chaque étudiant
    const emailPromises = students.map((student) => {
      return transporter.sendMail({
        from: '"Équipe PFA" <votre_email@gmail.com>',
        to: student.email, // Adresse email de l'étudiant
        subject, // Sujet de l'email
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