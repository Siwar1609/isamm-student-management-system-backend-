import SkillAssessment from '../../models/subject-models/skill_assesment_model.js'; // Assuming this is the model for skill assessments
import skillAssessmentValidator from '../../validators/skillAssesment_validator.js'; // Importing the validator
import mongoose from 'mongoose';

export const evaluateSkill = async (req, res) => {
  const { error } = skillAssessmentValidator.validate(req.body); // Validate the input
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { studentId, evaluation , academicYearId } = req.body;


    const skillAssessment = new SkillAssessment({
      studentId,
      evaluation,
      academicYearId,
    });

    await skillAssessment.save();

    return res.status(201).json({
      message: 'Skill assessment has been successfully recorded.',
      data: skillAssessment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while evaluating the skill.' });
  }
};

export const getAssessmentById = async (req, res) => {
  const { id } = req.params; 

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid assessment ID.' });
  }

  try {
    const skillAssessment = await SkillAssessment.findById(id)
      .populate('evaluation.skill') // Populate the 'skill' field with actual Skill data
      .populate('academicYearId'); 

    if (!skillAssessment) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    return res.status(200).json({
      message: 'Skill assessment retrieved successfully.',
      data: skillAssessment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while retrieving the assessment.' });
  }
};


export const getAssessment = async (req, res) => {
  try {
    const skillAssessments = await SkillAssessment.find()
      .populate('evaluation.skill') 
      .populate('academicYearId'); 

    return res.status(200).json({
      message: 'All skill assessments retrieved successfully.',
      data: skillAssessments,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while retrieving skill assessments.' });
  }
};
