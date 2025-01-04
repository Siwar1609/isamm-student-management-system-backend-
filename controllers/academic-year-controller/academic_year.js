import AcademicYear from '../../models/academic_year_models/academic-year-model.js';
import academicYearValidator from '../../validators/academic_year_validator.js';

export const createAcademicYear = async (req, res) => {
  try {
 
    const { error } = academicYearValidator.validate(req.body);

    if (error) {
    
      return res.status(400).json({
        error: error.details[0].message, 
        message: "Invalid data",
      });
    }

    const academicyear = new AcademicYear(req.body);
    await academicyear.save();

    
    res.status(201).json({
      model: academicyear,
      message: 'Academic year created successfully',
    })
  } catch (error) {
   
    res.status(500).json({
      error: error.message,
      message: 'Something went wrong while creating academic year',
    })
  }
};
export const deleteAcademicYear = async (req, res) => {
  try {
    const academicyear = await AcademicYear.findByIdAndDelete(req.params.id);
    if (!academicyear) {
      res.status(404).json({ message: "Academic Year not found" });
    } else {
      res.status(200).json({ model: academicyear, message: "Academic Year deleted successfully" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const fetchAcademicYear = async (req, res) => {
  try {
    const academicyear = await AcademicYear.find();
    res.status(200).json({ model: academicyear, message: "Academic Years Fetched Successfully !" });
  } catch (e) {
    res.status(400).json({ error: e.message, message: "Failed to fetch Academic Years" });
  }
};
