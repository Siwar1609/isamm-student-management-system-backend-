import Curriculum from '../../models/subject-models/curriculum_model.js'
import curriculumValidator from '../../validators/curriculum_validator.js'
import subject_model from '../../models/subject-models/subject_model.js'
import mongoose from 'mongoose'
import Subject from '../../models/subject-models/subject_model.js'
export const addCurriculum = async (req, res) => {
  try {
    const { error } = curriculumValidator.validate(req.body)

    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      })
    }

    const curriculum = new Curriculum(req.body)

    await curriculum.save()

    res.status(201).json({
      curriculum,
      message: 'Curriculum added successfully',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Failed to add curriculum',
    })
  }
}

export const updateCurriculum = async (req, res) => {
  try {
    const { error } = curriculumValidator.validate(req.body)

    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      })
    }

    const curriculum = await Curriculum.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true },
    )

    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' })
    }

    res.status(200).json({
      curriculum,
      message: 'Curriculum updated successfully',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const deleteCurriculum = async (req, res) => {
  try {
    const curriculum = await Curriculum.findByIdAndDelete(req.params.id)

    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' })
    }

    res.status(200).json({
      model: curriculum,
      message: 'Curriculum Deleted',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Fetch all Curriculums
export const fetchCurriculums = async (req, res) => {
  try {
    const curriculums = await Curriculum.find()
    res.status(200).json({
      model: curriculums,
      message: 'Curriculums fetched successfully',
    })
  } catch (e) {
    res.status(400).json({
      error: e.message,
      message: 'Failed to fetch curriculums',
    })
  }
}

export const getCurriculumByID = async (req, res) => {
  try {
    const curriculum = await Curriculum.findOne({ _id: req.params.id })
      .populate('subjectId')
      .populate('chapId')
      .populate('academicYearId')
      .exec()

    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' })
    }

    res.status(200).json({
      model: curriculum,
      message: 'Curriculum found',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
// curriculum_controller.js

// Nouvelle méthode pour récupérer par matière
export const getCurriculumBySubject = async (req, res) => {
  try {
    const curriculum = await Curriculum.findOne({ subjectId: req.params.subjectId })
      .populate('subjectId', 'title') // Seulement le titre de la matière
      .lean(); // Convertit en objet JavaScript simple

    if (!curriculum) {
      return res.status(200).json({
        success: true,
        model: null,
        message: 'Aucun curriculum trouvé'
      });
    }

    res.status(200).json({
      success: true,
      model: curriculum
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const addCurrToSubject = async (req, res) => {
  try {
    // Validation des données de la requête avec le validateur du curriculum
    const { error } = curriculumValidator.validate(req.body)
    if (error) return res.status(400).json({ error: error.details[0].message })

    // Récupération du sujet à partir de l'ID passé en paramètre
    const subject = await Subject.findById(req.params.subjectId)
    if (!subject) return res.status(404).json({ error: 'Subject not found' })

    // Création du nouveau curriculum avec les données envoyées dans la requête
    const curriculum = new Curriculum({
      ...req.body,
      subjectId: req.params.subjectId, // Association du curriculum au sujet
    })

    // Sauvegarde du curriculum dans la base de données
    await curriculum.save()

    // Associer le curriculum au sujet (uniquement un seul curriculum ici)
    subject.curriculumId = curriculum._id // Assigner l'ID du curriculum
    await subject.save()

    // Répondre avec le curriculum créé
    res.status(201).json(curriculum)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
