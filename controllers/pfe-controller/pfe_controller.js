import Period from '../../models/period-model/period_model.js'
import PFE from '../../models/project_models/project_pfe.js'

import { validatePFEPeriod } from '../../validators/periodValidation.js'
import { updatePFEValidation } from '../../validators/updatepfeValidation.js'

// Ajouter un PFE
export const addPFE = async (req, res) => {
  try {
    const {
      company_name,
      title,
      description,
      type,
      teacherId,
      studentId,
      numberOfStudents,
      affected,
      academicYear,
      documentId,
      periodId,
    } = req.body
    // Validation des données du corps de la requête
    const { error } = validatePFEPeriod.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }
    // Vérifier si la période est ouverte
    const period = await Period.findById(req.body.periodId)
    if (!period) {
      return res.status(404).json({ message: 'Période non trouvée' })
    }
    if (period.start_date > new Date()) {
      return res
        .status(400)
        .json({ message: "La période de dépôt n'est pas encore ouverte." })
    }

    // Créer un nouveau PFE
    const newPFE = new PFE({
      company_name,
      title,
      description,
      type,
      teacherId,
      studentId,
      numberOfStudents,
      affected,
      academicYear,
      documentId,
      periodId,
    })

    // Sauvegarder le PFE dans la base de données
    const savedPFE = await newPFE.save()

    return res
      .status(201)
      .json({ message: 'PFE ajouté avec succès', pfe: savedPFE })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erreur du serveur' })
  }
}

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
export const getPFEDetailsForStudent = async (req, res) => {
  try {
    const students = await Student.find()

    // Pour chaque étudiant, on récupère les détails de son PFE
    const studentDetails = await Promise.all(
      students.map(async (student) => {
        const pfeDetails = await PFE.findOne({
          studentId: student._id,
        })
          .populate('teacherId')
          .populate('documentId')
          .populate('periodId')
          .populate('academicYear')

        if (!pfeDetails) {
          return {
            student: student.name,
            message: 'Aucun PFE trouvé pour cet étudiant.',
          }
        }

        return {
          student: student.name,
          pfeTitle: pfeDetails.title,
          company: pfeDetails.company_name,
          description: pfeDetails.description,
          date_of_submission: pfeDetails.createdAt,
          affected: pfeDetails.affected,
          teacher: pfeDetails.teacherId
            ? pfeDetails.teacherId.name
            : 'Non affecté',
        }
      }),
    )

    res.status(200).json(studentDetails)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Erreur lors de la récupération des informations PFE.',
      error,
    })
  }
}
// Fonction pour qu'un enseignant choisisse un PFE
export const choosePFE = async (req, res) => {
  const { id } = req.params
  const { teacherId } = req.body

  try {
    // Vérifier si le PFE existe
    const pfe = await PFE.findById(id)

    if (!pfe) {
      return res.status(404).json({ message: 'PFE non trouvé.' })
    }

    // Vérifier si ce PFE a déjà un enseignant
    if (pfe.teacherId) {
      return res
        .status(400)
        .json({ message: 'Ce PFE a déjà été choisi par un autre enseignant.' })
    }
    pfe.teacherId = teacherId
    await pfe.save()
    res.status(200).json({ message: 'PFE choisi avec succès.' })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ message: 'Erreur lors de la mise à jour du PFE.', error })
  }
}
