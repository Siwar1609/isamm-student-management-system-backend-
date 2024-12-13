import subjectAssessmentValidator from '../../validators/subjectAssesment_validator.js';
import SubjectAssessment from '../../models/subject-models/subject_assesment_model.js'; 

export const evaluateSubject = async (req, res) => {
  const { error } = subjectAssessmentValidator.validate(req.body); // Validate the input
  if (error) {
    return res.status(400).json({ error: error.details[0].message }); 
  }

  try {
    const { studentId, subjectId, grade, academicYearId } = req.body;

   
    const subjectAssessment = new SubjectAssessment({
      studentId,
      subjectId,
      grade,
      academicYearId,
    });

  
    await subjectAssessment.save();

    return res.status(201).json({
      message: 'Subject assessment has been successfully recorded.',
      data: subjectAssessment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while evaluating the subject.' });
  }
};


