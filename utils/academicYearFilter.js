import AcademicYear from '../models/academic_year_models/academic-year-model.js';

// Get current academic year ID
export const getCurrentAcademicYearId = async () => {
  const currentYear = await AcademicYear.findOne({ current: true });
  return currentYear ? currentYear._id : null;
};

// Filter query by academic year - returns a query object that can be chained
export const filterByCurrentAcademicYear = async (model, fieldName) => {
  const currentYearId = await getCurrentAcademicYearId();
  if (!currentYearId) return model.find();
  
  // Return the query object without executing it
  return model.find({ [fieldName]: currentYearId });
};