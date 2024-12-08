import Curriculum from '../../models/subject-models/curriculum_model.js'; 
import curriculumValidator from '../../validators/curriculum_validator.js'; 


export const addCurriculum = async (req, res) => {
  try {
 
    const { error } = curriculumValidator.validate(req.body);


    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      });
    }

    const curriculum = new Curriculum(req.body);

   
    await curriculum.save();

    
    res.status(201).json({
      curriculum,
      message: 'Curriculum added successfully',
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Failed to add curriculum',
    });
  }
};


export const updateCurriculum = async (req, res) => {
  try {
  
    const { error } = curriculumValidator.validate(req.body);

    
    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      });
    }

 
    const curriculum = await Curriculum.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }

    res.status(200).json({
      curriculum,
      message: 'Curriculum updated successfully',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const deleteCurriculum = async (req, res) => {
  try {
    
    const curriculum = await Curriculum.findByIdAndDelete(req.params.id);

    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }

    res.status(200).json({
      model: curriculum,
      message: 'Curriculum Deleted',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Fetch all Curriculums
export const fetchCurriculums = async (req, res) => {
  try {
    const curriculums = await Curriculum.find();
    res.status(200).json({
      model: curriculums,
      message: 'Curriculums fetched successfully',
    });
  } catch (e) {
    res.status(400).json({
      error: e.message,
      message: 'Failed to fetch curriculums',
    });
  }
};


export const getCurriculumByID = async (req, res) => {
  try {
    const curriculum = await Curriculum.findOne({ _id: req.params.id })
      .populate('subjectId')
      .populate('chapId')
      .populate('academicYearId')
      .exec();

    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }

    res.status(200).json({
      model: curriculum,
      message: 'Curriculum found',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
