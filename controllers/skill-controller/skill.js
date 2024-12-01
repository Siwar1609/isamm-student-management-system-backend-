import Skill from '../../models/subject-models/skill_model.js';
import skillValidator from '../../validators/skill_validator.js';  // Import the Joi validator

// Fetch all skills
export const fetchSkill = async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json({
      model: skills,
      message: 'Skills fetched successfully',
    });
  } catch (e) {
    res.status(400).json({
      error: e.message,
      message: 'Failed to fetch skills',
    });
  }
};

// Get a skill by ID
export const getSkillbyID = async (req, res) => {
  try {
    console.log("id: ", req.params.id);
    const skill = await Skill.findOne({ _id: req.params.id });
    if (!skill) {
      res.status(404).json({ model: skill, message: "Skill not found" });
    } else {
      res.status(200).json({
        model: skill,
        message: "Skill Found",
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a skill by ID
export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.status(200).json({
      model: skill,
      message: 'Skill Deleted',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a skill by ID
export const updateSkill = async (req, res) => {
  try {
    console.log("body: ", req.body);
    console.log("id:", req.params.id);

    // Validate the request body
    const { error } = skillValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const skill = await Skill.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });

    if (!skill) {
      res.status(404).json({ message: "Skill not found" });
    } else {
      res.status(200).json({
        model: skill,
        message: "Skill Updated",
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add a new skill
export const addSkill = async (req, res) => {
  try {
    console.log("body: ", req.body);

    // Validate the request body
    const { error } = skillValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const skill = new Skill(req.body);
    await skill.save();
    res.status(201).json({
      model: skill,
      message: "Skill created successfully",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: "Invalid data",
    });
  }
};
