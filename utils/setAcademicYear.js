import AcademicYear from '../models/academic_year_models/academic-year-model.js'

export const setAcademicYear = async function (next) {
  try {
    // Only set academic year if it's not already set
    if (!this.academicYearId) {
      const currentYear = await AcademicYear.findOne({ current: true })
      
      if (currentYear) {
        this.academicYearId = currentYear._id
        console.log(`Setting academic year to ${currentYear._id} for new document`)
      } else {
        console.warn('No current academic year found')
      }
    }
    
    next()
  } catch (error) {
    console.error('Error in setAcademicYear middleware:', error)
    next(error)
  }
}
