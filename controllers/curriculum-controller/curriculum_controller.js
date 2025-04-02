import Curriculum from '../../models/subject-models/curriculum_model.js'

import subject_model from '../../models/subject-models/subject_model.js'
import mongoose from 'mongoose'
import Subject from '../../models/subject-models/subject_model.js'
import { createCurriculumValidator, updateCurriculumValidator } from '../../validators/curriculum_validator.js';

export const addCurrToSubject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Subject ID:', req.params.subjectId);

    // Validation
    const { error } = createCurriculumValidator.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message.replace(/['"]/g, '')
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors
      });
    }

    // Vérifier que le sujet existe
    const subject = await Subject.findById(req.params.subjectId).session(session);
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    // Vérifier qu'un curriculum n'existe pas déjà
    const existingCurriculum = await Curriculum.findOne({ subjectId: req.params.subjectId }).session(session);
    if (existingCurriculum) {
      return res.status(409).json({
        success: false,
        error: 'A curriculum already exists for this subject',
        existingCurriculumId: existingCurriculum._id
      });
    }

    // Créer le curriculum
    const curriculum = new Curriculum({
      title: req.body.title,
      description: req.body.description,
      subjectId: req.params.subjectId,
      academicYearId: req.body.academicYearId || null,
      chapId: req.body.chapId || []
    });

    const savedCurriculum = await curriculum.save({ session });

    // Lier le curriculum au sujet
    subject.curriculumId = savedCurriculum._id;
    await subject.save({ session });

    await session.commitTransaction();
    
    return res.status(201).json({
      success: true,
      model: savedCurriculum,
      message: 'Curriculum created and linked successfully'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error in addCurrToSubject:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      params: req.params
    });
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      systemMessage: error.message
    });
  } finally {
    session.endSession();
  }
};

export const updateCurriculum = async (req, res) => {
  try {
    console.log('Update request:', {
      id: req.params.id,
      body: req.body
    });

    // Validation partielle (seulement les champs fournis)
    const { error } = updateCurriculumValidator.validate(req.body, { 
      abortEarly: false,
      presence: 'optional'
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message.replace(/['"]/g, '')
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors
      });
    }

    // Construction de l'objet de mise à jour
    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.academicYearId !== undefined) updateData.academicYearId = req.body.academicYearId;
    if (req.body.chapId !== undefined) updateData.chapId = req.body.chapId;

    const updatedCurriculum = await Curriculum.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('subjectId');

    if (!updatedCurriculum) {
      return res.status(404).json({
        success: false,
        error: 'Curriculum not found'
      });
    }

    return res.status(200).json({
      success: true,
      model: updatedCurriculum,
      message: 'Curriculum updated successfully'
    });

  } catch (error) {
    console.error('Error in updateCurriculum:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      params: req.params
    });
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      systemMessage: error.message
    });
  }
};
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
