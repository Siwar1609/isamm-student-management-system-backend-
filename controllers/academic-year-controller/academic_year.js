import AcademicYear from '../../models/academic_year_models/academic-year-model.js'
import academicYearValidator from '../../validators/academicYear_validator.js' // Import the Joi validator

export const createAcademicYear = async (req, res) => {
  try {
    // Validate the request body using Joi validator
    const { error } = academicYearValidator.validate(req.body)

    if (error) {
      // If validation fails, return a 400 status with error details
      return res.status(400).json({
        error: error.details[0].message, // The error message from Joi
        message: 'Invalid data',
      })
    }

    // Proceed with creating the academic year if validation passes
    const academicyear = new AcademicYear(req.body)
    await academicyear.save()

    // Return a success response with the created academic year
    res.status(201).json({
      model: academicyear,
      message: 'Academic year created successfully',
    })
  } catch (error) {
    // Handle any unexpected errors
    res.status(500).json({
      error: error.message,
      message: 'Something went wrong while creating academic year',
    })
  }
}
