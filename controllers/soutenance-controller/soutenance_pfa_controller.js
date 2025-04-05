import PFA from '../../models/project_models/project_pfa.js'
import Teacher from '../../models/users-models/teacher_model.js'
import Student from '../../models/users-models/student_model.js'
import { ObjectId } from 'mongodb'
import validatePFASoutenanceData from '../../validators/soutenance_pfa_validator.js'
import soutenance_pfa from '../../models/soutenances-models/soutenance_pfa.js'
import soutenancePFAUpdateValidator from '../../validators/soutenance_pfa_updateValidator.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Fonction pour incrémenter une heure donnée
function incrementTime(time, minutes) {
  const [hours, mins] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60) % 24 // S'assurer que les heures ne dépassent pas 24
  const newMins = totalMinutes % 60
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`
}

// Fonction pour mélanger un tableau
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

// Étape 2 : Compter les occurrences de chaque teacherId
function countTeacherOccurrences(pfaList) {
  const occurrences = {}
  pfaList.forEach((pfa) => {
    occurrences[pfa.teacherId] = (occurrences[pfa.teacherId] || 0) + 1
  })

  const teacherOccurrences = Object.keys(occurrences).map((teacherId) => ({
    teacherId,
    count: occurrences[teacherId],
  }))

  shuffleArray(teacherOccurrences) // Mélanger pour éviter des patterns
  return teacherOccurrences
}

// Étape 3 : Générer les créneaux
function generateSlots(jours, salles) {
  const slots = []
  jours.forEach((jour) => {
    let currentTime = '09:00'
    let slotsPerDay = 0

    while (slotsPerDay < 6) {
      // Maximum 6 soutenances par jour
      salles.forEach((salle) => {
        slots.push({ date: jour, time: currentTime, room: salle })
      })
      currentTime = incrementTime(currentTime, 30)
      slotsPerDay++
    }
  })
  return slots
}

async function assignRapporteurs(
  pfaList,
  teacherOccurrences,
  providedRapporteurIds = [],
) {
  for (const pfa of pfaList) {
    const encadrantId =
      pfa.teacherId instanceof ObjectId
        ? pfa.teacherId.toString()
        : pfa.teacherId
    let rapporteurId = null

    // Étape 1 : Rechercher un rapporteur parmi les enseignants disponibles dans teacherOccurrences
    for (const teacher of teacherOccurrences) {
      const teacherId =
        teacher.teacherId instanceof ObjectId
          ? teacher.teacherId.toString()
          : teacher.teacherId // Normaliser teacherId

      if (teacherId !== encadrantId && teacher.count > 0) {
        rapporteurId = teacherId
        teacher.count -= 1 // Décrémenter le nombre d'occurrences
        break // Sortir de la boucle une fois un rapporteur trouvé
      }
    }

    // Étape 2 : Si aucun rapporteur trouvé, vérifier dans la liste providedRapporteurIds
    if (!rapporteurId && providedRapporteurIds.length > 0) {
      const availableRapporteur = providedRapporteurIds.find(
        (id) => id.toString() !== encadrantId,
      ) // Vérifier si un rapporteurId dans la liste est valide
      if (availableRapporteur) {
        rapporteurId = availableRapporteur.toString()
        providedRapporteurIds = providedRapporteurIds.filter(
          (id) => id.toString() !== rapporteurId,
        ) // Retirer le rapporteur assigné de la liste
      }
    }

    // Étape 3 : Si aucun rapporteur trouvé jusque-là, chercher un enseignant supplémentaire dans la table Teacher
    if (!rapporteurId) {
      const extraTeachers = await Teacher.find({
        _id: { $ne: new ObjectId(encadrantId) },
      }) // Rechercher en excluant l'encadrantId
      if (extraTeachers.length > 0) {
        const teacher = extraTeachers.find(
          (t) => t._id.toString() !== encadrantId,
        ) // Vérification supplémentaire
        rapporteurId = teacher?._id?.toString() // Extraire l'ID en tant que chaîne
      }
    }

    // Étape 4 : Si toujours aucun rapporteur n'est disponible, lever une erreur
    if (!rapporteurId) {
      throw new Error('Pas de rapporteur disponible pour cette soutenance.')
    }

    // Ajouter le rapporteur au PFA
    pfa.rapporteurId = new ObjectId(rapporteurId) // Assurez-vous que c'est un ObjectId si nécessaire
  }
}

// Étape 5 : Assigner les soutenances
async function assignSlots(pfaList, slots) {
  const planning = []
  const usedSlots = {}

  for (const pfa of pfaList) {
    const encadrantId = pfa.teacherId
    let slot = null
    let rapporteurId = pfa.rapporteurId

    while (slots.length > 0) {
      slot = slots.shift()
      if (
        (!usedSlots[encadrantId] ||
          usedSlots[encadrantId][slot.date] !== slot.time) &&
        (!usedSlots[rapporteurId] ||
          usedSlots[rapporteurId][slot.date] !== slot.time)
      ) {
        break
      }
    }

    if (!slot) {
      throw new Error(
        'Les jours ne sont pas suffisant pour le planning de soutennace.',
      )
    }

    planning.push({
      date: slot.date,
      time: slot.time,
      room: slot.room,
      pfaId: pfa._id,
      students: pfa.list_of_student,
      encadrant: encadrantId,
      rapporteur: rapporteurId,
    })

    usedSlots[encadrantId] = {
      ...usedSlots[encadrantId],
      [slot.date]: slot.time,
    }
    usedSlots[rapporteurId] = {
      ...usedSlots[rapporteurId],
      [slot.date]: slot.time,
    }
  }

  return planning
}

export const planifier = async (req, res) => {
  // Valider les données
  const { error } = validatePFASoutenanceData.validate(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
  const { jours, salles } = req.body
  try {
    // Étape 1 : Récupérer les PFAs
    const pfaList = await PFA.find(
      // {},
      { affected: true, rejected: false },
      { list_of_student: 1, _id: 1, teacherId: 1 },
    )

    // Étape 2 : Compter les occurrences de chaque teacherId
    const teacherOccurrences = countTeacherOccurrences(pfaList)
    console.log(teacherOccurrences)

    // Étape 3 : Générer les créneaux
    const slots = generateSlots(jours, salles)
    console.log(slots)
    // Étape 4 : Assigner les rapporteurs
    await assignRapporteurs(
      pfaList,
      teacherOccurrences,
      req.body.rapporteurId || [],
    )

    // Étape 5 : planifier les soutenances
    const planning = await assignSlots(pfaList, slots, teacherOccurrences)
    console.log(teacherOccurrences)

    // // Étape 6 : Enregistrer le planning dans `soutenance`
    for (const element of planning) {
      const soutenance = new soutenance_pfa({
        date: element.date,
        time: element.time,
        room: element.room,
        pfa: element.pfaId,
        encadrant: element.encadrant,
        rapporteur: element.rapporteur,
        list_of_student: element.students,
      })

      const saved = await soutenance.save()
    }
    res.status(200).json(planning)
  } catch (error) {
    console.error('Erreur lors de la planification :', error.stack || error)
    res.status(500).send('Une erreur est survenue lors de la planification.')
  }
}

export const fetch_soutenances = async (req, res) => {
  try {
    const soutenances = await soutenance_pfa.find()
    res.status(200).json({ model: soutenances, message: 'success ' })
  } catch (e) {
    res.status(400).json({ error: e.message, message: 'access problem' })
  }
}

export const updateSoutenance = async (req, res) => {
  try {
    const soutenanceId = req.params.id
    const updates = req.body // Contient uniquement les champs à modifier

    // Rechercher la soutenance existante
    const existingSoutenance = await soutenance_pfa.findById(soutenanceId)

    if (!existingSoutenance) {
      return res.status(404).json({
        message: 'Soutenance introuvable.',
      })
    }

    // Valider les données
    const { error } = soutenancePFAUpdateValidator.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    // Fusionner les données existantes avec les nouvelles données
    const updatedData = {
      date: updates.date || existingSoutenance.date,
      time: updates.time || existingSoutenance.time,
      room: updates.room || existingSoutenance.room,
      encadrant: updates.encadrant || existingSoutenance.encadrant,
      rapporteur: updates.rapporteur || existingSoutenance.rapporteur,
    }

    // Vérifier les conflits pour la salle, l'encadrant et le rapporteur
    const conflicts = await soutenance_pfa.find({
      _id: { $ne: soutenanceId }, // Exclure l'entrée actuelle
      date: updatedData.date,
      time: updatedData.time,
      $or: [
        { room: updatedData.room },
        { encadrant: updatedData.encadrant },
        { rapporteur: updatedData.rapporteur },
      ],
    })

    if (conflicts.length > 0) {
      return res.status(409).json({
        message:
          'Conflit détecté : La salle, l’encadrant ou le rapporteur est déjà assigné à une autre soutenance à la même date et heure.',
      })
    }

    // Mettre à jour la soutenance avec les nouvelles données
    const updatedSoutenance = await soutenance_pfa.findByIdAndUpdate(
      soutenanceId,
      updatedData,
      { new: true }, // Retourner l'objet mis à jour
    )

    return res.status(200).json({
      message: 'Planning mis à jour avec succès.',
      soutenance: updatedSoutenance,
    })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

export const publish_soutenances = async (req, res) => {
  try {
    // Convertir response en booléen
    const response = req.params.response === 'true'

    if (!response) {
      // Si response=false, masquer tous les PFA
      await soutenance_pfa.updateMany({}, { published: false })
      return res.status(200).json({
        message: 'Planning des soutenance masquée avec succès.',
      })
    } else {
      // Publier les PFA non rejetés
      await soutenance_pfa.updateMany({}, { published: true })
      return res.status(200).json({
        message: 'Planning des soutenances publié avec succès.',
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

export const send_soutenancePfa_list_email = async (req, res) => {
  try {
    // Récupérer la liste des étudiants
    const students = await Student.find({ role: 'student', level: '2' })
    const studentEmails = students.map((student) => student.email)

    // Récupérer la liste des enseignants
    const soutenances = await soutenance_pfa
      .find({})
      .populate('encadrant rapporteur')
    const teacherIds = new Set()

    // Extraire les enseignants (rapporteurs et encadrants)
    for (const soutenance of soutenances) {
      if (soutenance.encadrant) {
        teacherIds.add(soutenance.encadrant._id.toString())
      }
      if (soutenance.rapporteur) {
        teacherIds.add(soutenance.rapporteur._id.toString())
      }
    }

    const teachers = await Teacher.find({
      _id: { $in: Array.from(teacherIds) },
    })
    const teacherEmails = teachers.map((teacher) => teacher.email)
    console.log(teacherEmails, studentEmails)

    // Fusionner les adresses e-mail (étudiants et enseignants)
    const allEmails = [...studentEmails, ...teacherEmails]

    // Vérifier s'il existe au moins une soutenance avec send=true
    const soutenanceSendStatus = await soutenance_pfa
      .findOne({ send: true })
      .select('send')
    const isFirstSend = !soutenanceSendStatus // Si aucun PFA avec send=true, c'est le premier envoi

    // Configurer le transporteur d'email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Contenu du mail
    const htmlContent = generateEmailTemplate(isFirstSend)

    // Définir les options d'e-mail
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: allEmails, // Liste des destinataires
      subject: isFirstSend
        ? 'Invitation : Planning de la soutenance PFA'
        : 'Mise à jour : Planning de la soutenance PFA',
      html: htmlContent, // Contenu HTML de l'email
    }

    // Envoyer l'e-mail
    await transporter.sendMail(mailOptions)

    // Si c'est le premier envoi, mettre à jour "send" à true pour tous les PFA
    // -------------
    if (isFirstSend) {
      await soutenance_pfa.updateMany({}, { send: true })
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
          <h1>${isFirstSend ? 'Invitation : Planning de la soutenance PFA' : 'Mise à jour : Planning de la soutenance PFA'}</h1>
      </div>
      <div class="content">
          <p class="black">Bonjour,</p>
          <p>${
            isFirstSend
              ? 'Cher(e) participant(e),\n\nVous êtes invité(e) à participer à la soutenance PFA. Veuillez trouver les détails ci-dessous.'
              : 'Cher(e) participant(e),\n\nLe planning de la soutenance PFA a été mis à jour. Veuillez consulter les nouvelles informations.'
          }</p>
          <p><a href="http://v1/soutenancepfa/list">http://v1/soutenancepfa/list</a></p>
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

export const fetch_by_filter = async (req, res) => {
  try {
    const { filter, id } = req.params

    let query
    if (filter === 'teacher') {
      // Recherche des soutenances pour un enseignant
      query = { $or: [{ rapporteur: id }, { encadrant: id }] }
    } else if (filter === 'student') {
      // Recherche des soutenances pour un étudiant
      query = { list_of_student: id }
    } else {
      return res.status(400).json({
        message: 'Filtre invalide. Utilisez "teacher" ou "student".',
      })
    }

    // Rechercher les soutenances avec le filtre approprié
    const soutenances = await soutenance_pfa
      .find(query)
      .select('date time room') // Sélectionner uniquement les champs nécessaires
      .populate({ path: 'rapporteur', select: 'email phone' })
      .populate({ path: 'encadrant', select: 'email phone' })
      .populate({ path: 'pfa', select: 'title description technologies_list ' })
      .exec()

    // Vérifier si des soutenances ont été trouvées
    if (!soutenances || soutenances.length === 0) {
      return res.status(404).json({
        message: 'Aucune soutenance trouvée pour ce filtre et cet ID.',
      })
    }

    // Réponse réussie
    return res.status(200).json({
      models: soutenances,
      message: 'Soutenances récupérées avec succès.',
    })
  } catch (error) {
    // Gestion des erreurs
    return res.status(400).json({
      error: error.message,
      message: 'Erreur lors de la récupération des soutenances.',
    })
  }
}

// ------------------------ Enseignant -----------------------------------------------------------------
export const fetch_my_soutenance = async (req, res) => {
  try {
    // Filtre pour récupérer uniquement les sujets postés par l'enseignant authentifié
    const teacherId = req.auth.userId
    const soutenancePFA = await soutenance_pfa.find({
      $or: [
        { rapporteur: teacherId }, // Filtrer par rapporteur
        { encadrant: teacherId }, // Filtrer par encadrant
      ],
    })
    res.status(200).json({ model: soutenancePFA, message: 'success ' })
  } catch (e) {
    res.status(400).json({ error: e.message, message: 'access problem' })
  }
}

export const fetch_my_soutenance_byId = async (req, res) => {
  try {
    // Recherche de la soutenance par ID avec `populate`
    const soutenance = await soutenance_pfa
      .findOne({ _id: req.params.id })
      .populate({
        path: 'pfa',
        select: 'title description technologies_list ',
      })
      .populate({
        path: 'list_of_student',
        select: 'firstName lastName email phone academicYearlevel',
      })
      .exec()
    // Vérification si le projet existe
    if (!soutenance) {
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
    }
    // Réponse réussie
    res.status(200).json({
      model: soutenance,
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

//--------------------------- Student ----------------------------------------------
export const fetch_my_soutenances_as_student = async (req, res) => {
  try {
    // Recherche des soutenances où l'utilisateur authentifié est dans `list_of_student`
    const mySoutenances = await soutenance_pfa
      .find({ list_of_student: req.auth.userId })
      .select('date time room')
      .populate({
        path: 'rapporteur',
        select: 'email phone',
      })
      .populate({
        path: 'encadrant',
        select: 'email phone',
      })
      .exec()

    // Vérification si des soutenances existent
    if (!mySoutenances || mySoutenances.length === 0) {
      return res.status(404).json({
        message: 'Aucune soutenance trouvée pour cet utilisateur.',
      })
    }

    // Réponse réussie
    return res.status(200).json({
      models: mySoutenances,
      message: 'Soutenances récupérées avec succès.',
    })
  } catch (error) {
    // Gestion des erreurs
    return res.status(400).json({
      error: error.message,
      message: 'Erreur lors de la récupération des soutenances.',
    })
  }
}
