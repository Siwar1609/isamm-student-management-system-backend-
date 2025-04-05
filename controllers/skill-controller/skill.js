import Skill from '../../models/subject-models/skill_model.js';
import skillValidator from '../../validators/skill_validator.js';  
import Subject from '../../models/subject-models/subject_model.js';  // Assurez-vous que ce chemin est correct
// Import the Joi validator

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
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ message: 'Compétence non trouvée' });
    }

    const subjectWithSkill = await Subject.findOne({ skillId: req.params.id });

    // Convertir le paramètre force en booléen
    const force = req.query.force === 'true';

    if (subjectWithSkill && !force) {
      return res.status(400).json({
        message: `Cette compétence est liée à la matière "${subjectWithSkill.title}".`,
        subject: subjectWithSkill.title,
        warning: true
      });
    }

    await Skill.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Compétence supprimée avec succès' });
    
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      message: 'Erreur lors de la suppression' 
    });
  }
};


export const updateSkill = async (req, res) => {
  try {
    console.log("body: ", req.body);
    console.log("id:", req.params.id);

  
    const { error } = skillValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { force } = req.body;

    const subjectWithSkill = await Subject.findOne({ skillId: req.params.id });

    if (subjectWithSkill) {
      if (!force) {
       
        return res.status(400).json({
          message: `Warning ! Skill is assigned to this subject :"${subjectWithSkill.title}". Use "force: true" to force the update.`,
          warning: "Pay attention !",
        });
      }
      console.log(`Skill assigned to subject"${subjectWithSkill.title}". The update is forced.`);
    }

    const skill = await Skill.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    res.status(200).json({
      model: skill,
      message: "Skill Updated",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



export const addSkill = async (req, res) => {
  try {
    console.log("body: ", req.body);

   
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
