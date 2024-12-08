import Curriculum from '../../models/subject-models/curriculum_model.js'; // Import the Curriculum model
import curriculumValidator from '../../validators/curriculum_validator.js'; // Import the validation schema

// Add a new Curriculum
export const addCurriculum = async (req, res) => {
  try {
    // Validate the request body using Joi
    const { error } = curriculumValidator.validate(req.body);

    // If validation fails, return an error response
    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      });
    }

    // Create a new Curriculum instance with the validated data
    const curriculum = new Curriculum(req.body);

    // Save the curriculum to the database
    await curriculum.save();

    // Return a success response with the created curriculum
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

// Update an existing Curriculum by ID
export const updateCurriculum = async (req, res) => {
  try {
    // Validate the request body using Joi
    const { error } = curriculumValidator.validate(req.body);

    // If validation fails, return an error response
    if (error) {
      return res.status(400).json({
        error: error.message,
        message: 'Invalid data!',
      });
    }

    // Attempt to update the curriculum by its ID
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

// Delete a Curriculum by ID
export const deleteCurriculum = async (req, res) => {
  try {
    // Attempt to delete the curriculum by its ID
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

// Get a Curriculum by ID
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
