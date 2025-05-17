import AcademicYear from '../../models/academic_year_models/academic-year-model.js'
import PFA from '../../models/project_models/project_pfa.js'
import PFE from '../../models/project_models/project_pfe.js'
import Subject from '../../models/subject-models/subject_model.js'
import Internship from '../../models/internship-models/internship_model.js'
import Option from '../../models/option-models/option_result_model.js'
import OptionChoice from '../../models/option-models/option_model.js'
import mongoose from 'mongoose'


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

    // Find the current academic year before changing it
    const previousYear = await AcademicYear.findOne({ current: true });
    
    if (!previousYear) {
      return res
        .status(400)
        .json({ message: 'No current academic year found to copy subjects from.' })
    }

    // Mark all existing academic years as not current
    await AcademicYear.updateMany({}, { current: false, status: 'off' })

    // Create the new academic year
    const newYear = new AcademicYear({ 
      start_year, 
      end_year, 
      current: true,
      status: 'pending'
    })
    await newYear.save()

    // Archive previous year data
    await PFA.updateMany({}, { published: false, send: false })
    await PFE.updateMany({}, { published: false, send: false })
    await Internship.updateMany({}, { published: false })
    await Option.updateMany({}, { published: false })

    // Get only subjects from the previous academic year
    const existingSubjects = await Subject.find({ academicYearId: previousYear._id })
    
    console.log(`Copying ${existingSubjects.length} subjects from previous year ${previousYear._id} to new year ${newYear._id}`)
    
    // Create copies of subjects with the new academic year ID
    for (const subject of existingSubjects) {
      // Create a new subject document
      const newSubject = new Subject({
        title: subject.title,
        description: subject.description,
        level: subject.level,
        semester: subject.semester,
        chapId: subject.chapId,
        skillId: subject.skillId,
        Assesment_Id: subject.Assesment_Id,
        published: true,
        propositionValidated: true,
        academicYearId: newYear._id, // Explicitly set the new academic year ID
        curriculumId: subject.curriculumId,
        studentId: [], // Empty student list for new year
        teacherId: [], // Empty teacher list for new year
      })
      
      // Save the new subject
      await newSubject.save()
    }

    res
      .status(201)
      .json({ 
        message: 'New academic year created successfully.', 
        newYear,
        subjectsCreated: existingSubjects.length
      })
  } catch (error) {
    console.error('Error creating new season:', error)
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

// Add this function to the years_controller.js file
export const getCurrentAcademicYear = async (req, res) => {
  try {
    const currentYear = await AcademicYear.findOne({ current: true });
    
    if (!currentYear) {
      return res.status(404).json({
        message: 'No active academic year found',
      });
    }

    return res.status(200).json({
      message: 'Current academic year retrieved successfully',
      academicYear: currentYear,
    });
  } catch (error) {
    console.error('Error getting current academic year:', error);
    return res.status(500).json({
      message: 'Failed to get current academic year',
      error: error.message,
    });
  }
};

// Add this function to delete an academic year and its related data
// Add this function to the years_controller.js file

export const deleteAcademicYear = async (req, res) => {
  const { academicYearId } = req.params;

  try {
    // Check if the academic year exists
    const academicYear = await AcademicYear.findById(academicYearId);
    if (!academicYear) {
      return res.status(404).json({ message: 'Academic year not found.' });
    }

    // Check if it's the current academic year
    if (academicYear.current) {
      return res.status(400).json({ 
        message: 'Cannot delete the current academic year. Please switch to another year first.' 
      });
    }

    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete all subjects related to this academic year
      await Subject.deleteMany({ academicYearId: academicYearId }, { session });
      
      // Delete the academic year
      await AcademicYear.findByIdAndDelete(academicYearId, { session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: 'Academic year and related data deleted successfully.',
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting academic year:', error);
    res.status(500).json({ 
      message: 'Server error while deleting academic year.', 
      error: error.message 
    });
  }
};
