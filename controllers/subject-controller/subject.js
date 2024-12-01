import Subject from '../../models/subject-models/subject_model.js';
import subjectValidator from '../../validators/subject_validator.js'; // Import the validation schema

export const addSubject = async (req, res) => {
  try {
    // Validate the request body using Joi
    const { error } = subjectValidator.validate(req.body);
    
    // If validation fails, return an error response
    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      });
    }

    // Create a new Subject instance with the validated data
    const subject = new Subject(req.body);

    // Save the subject to the database
    await subject.save();

    // Return a success response with the created subject
    res.status(201).json({
      subject,
      message: 'Subject added successfully',
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Failed to add subject',
    });
  }
};

export const updateSubject = async (req, res) => {
  try {
    // Validate the request body using Joi
    const { error } = subjectValidator.validate(req.body);
    
    // If validation fails, return an error response
    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      });
    }

    // Attempt to update the subject by its ID
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.status(200).json({
      subject,
      message: 'Subject updated successfully',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const deleteSubject = async (req, res) => {
    try {
      // Attempt to delete the subject by its ID
      const subject = await Subject.findByIdAndDelete(req.params.id);
  
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
  
      res.status(200).json({
        model: subject,
        message: 'Subject Deleted',
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  export const fetchSubjects = async (req, res) => {
    try {
      const subjects = await Subject.find();
      res.status(200).json({
        model: subjects,
        message: 'Subjects fetched successfully',
      });
    } catch (e) {
      res.status(400).json({
        error: e.message,
        message: 'Failed to fetch subjects',
      });
    }
  };
  
  export const getSubjectbyID = async (req, res) => {
    try {
      const subject = await Subject.findOne({ _id: req.params.id })
        .populate('chapId')
        .populate('skillId')
        .populate('curriculumId')
        .exec();
  
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
  
      res.status(200).json({
        model: subject,
        message: 'Subject found',
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };