import AcademicYear from '../../models/academic_year_models/academic-year-model.js'
import PFA from '../../models/project_models/project_pfa.js'
import PFE from '../../models/project_models/project_pfe.js'
import Subject from '../../models/subject-models/subject_model.js'
import Internship from '../../models/internship-models/internship_model.js'
import Option from '../../models/option-models/option_result_model.js'
import OptionChoice from '../../models/option-models/option_model.js'

export const openNewSeason = async (req, res) => {
  const { start_year, end_year } = req.body

  try {
    // Ensure no overlapping years
    const existingYear = await AcademicYear.findOne({ start_year, end_year })

    if (existingYear) {
      return res
        .status(400)
        .json({ message: 'Academic year overlaps with an existing year.' })
    }

    // Mark all existing academic years as not current
    await AcademicYear.updateMany({}, { current: false, status: 'off' })

    // Create the new academic year
    const newYear = new AcademicYear({ start_year, end_year, current: true })
    await newYear.save()

    // Archive previous year data
    await PFA.updateMany({}, { published: false, send: false })
    await PFE.updateMany({}, { published: false, send: false })
    await Internship.updateMany({}, { published: false })
    await Option.updateMany({}, { published: false })

    // Reset teacher-student assignments in matières
    // get all matières

    await Subject.updateMany({}, { studentId: [], teacherId: [] })
    // after realeasing the students and the teachers in the database we have to add it to the new year created
    // get all matières
    const matieres = await Subject.find()
    // get the new year created
    const academicYear = await AcademicYear.findOne({ current: true })
    // loop through the matières and add the new year to it
    matieres.forEach(async (matiere) => {
      matiere.academicYearId = academicYear._id
      await matiere.save()
    })
    // Reset option results
    // await Option.deleteMany({})

    res
      .status(201)
      .json({ message: 'New academic year created successfully.', newYear })
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message })
  }
}

//************************************************************ */
export const switchAcademicYear = async (req, res) => {
  const { academicYearId } = req.body

  try {
    const academicYear = await AcademicYear.findById(academicYearId)
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found.' })
    }

    // Mark the selected year as current
    await AcademicYear.updateMany({}, { current: false, status: 'off' })
    academicYear.current = true
    academicYear.status = 'pending'
    await academicYear.save()

    // Fetch data for the selected academic year
    const pfas = await PFA.find({ academicyear: academicYearId })
    const pfes = await PFE.find({ academicyear: academicYearId })
    const matieres = await Subject.find({
      academicYearId: academicYearId,
    }).populate('teacherId chapId skillId Assesment_Id level semester')
    const internships = await Internship.find({
      academicYear: academicYearId,
    })
    const options = await Option.find({ academic_year: academicYearId })
    const optionChoices = await OptionChoice.find({
      academic_year: academicYearId,
    })

    res.status(200).json({
      message: 'Switched to selected academic year.',
      academicYear,
      pfas,
      pfes,
      matieres,
      internships,
      options,
      optionChoices,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message })
  }
}
