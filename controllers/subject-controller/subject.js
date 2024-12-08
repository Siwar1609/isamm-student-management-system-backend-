import Subject from '../../models/subject-models/subject_model.js';
import subjectValidator from '../../validators/subject_validator.js'; // Import the validation schema

export const addSubject = async (req, res) => {
  try {
    
    const { error } = subjectValidator.validate(req.body);
    
   
    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      });
    }

    const subject = new Subject(req.body);

 
    await subject.save();

    
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
   
    const { error } = subjectValidator.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      });
    }


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