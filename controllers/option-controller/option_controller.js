import Option from '../../models/option-models/option_model.js'
import AcademicYear from '../../models/academic_year_models/academic-year-model.js'
import Period from '../../models/period-model/period_model.js'
import Student from '../../models/users-models/student_model.js'
import OptionResults from '../../models/option-models/option_result_model.js'
import nodemailer from 'nodemailer'

// Add Option Controller
export const addOption = async (req, res) => {
  try {
    // Destructure the required fields from the request body
    const {
      name,
      reason,
      academic_year,
      url,
      groupName,
      repitationIn1stYear,
      generalAverage,
      integrationYear,
      successSession,
      webDevGrade,
      oopGrade,
      algorithmsGrade,
    } = req.body

    // Validate required fields
    if (
      !name ||
      !reason ||
      !academic_year ||
      !url ||
      !groupName ||
      !repitationIn1stYear ||
      !integrationYear ||
      !successSession
    ) {
      return res.status(400).json({
        message: 'Missing required fields.',
      })
    }

    // Fetch the logged-in student's ID from the session or authentication middleware
    const studentId = req.auth.userId // Assuming `req.user` is populated by your authentication middleware
    if (!studentId) {
      return res.status(403).json({ message: 'User not authenticated.' })
    }

    // Validate the student's existence
    const studentExists = await Student.exists({ _id: studentId })
    if (!studentExists) {
      return res.status(404).json({ message: 'Invalid student ID.' })
    }

    // Validate referenced IDs
    const academicYearExists = await AcademicYear.exists({ _id: academic_year })
    if (!academicYearExists) {
      return res.status(400).json({ message: 'Invalid academic year ID.' })
    }

    // Fetch the most recent active period dynamically
    const currentPeriod = await Period.findOne({
      name: 'Choix d’option',
      end_date: { $gte: new Date() }, // Period end date is after or equal to today
    })

    if (!currentPeriod) {
      return res
        .status(400)
        .json({ message: 'No active period for option choices.' })
    }
    const existingOption = await Option.findOne({
      student: studentId,
      period: currentPeriod._id,
    })

    if (existingOption) {
      return res.status(400).json({
        message: 'The student has already posted an option for this period.',
      })
    }

    // Create a new Option instance
    const newOption = new Option({
      name,
      reason,
      student: [studentId], // Associate the option with the logged-in student
      academic_year,
      period: currentPeriod._id, // Assign dynamically fetched period
      url,
      groupName,
      repitationIn1stYear,
      generalAverage,
      integrationYear,
      successSession,
      webDevGrade,
      oopGrade,
      algorithmsGrade,
    })

    // Save the Option to the database
    const savedOption = await newOption.save()

    // Respond with the saved Option
    res.status(201).json({
      message: 'Option added successfully.',
      option: savedOption,
    })
  } catch (error) {
    console.error('Error adding option:', error)
    res.status(500).json({
      message: 'An error occurred while adding the option.',
      error: error.message,
    })
  }
}

// Get All Options
export const getAllOptions = async (req, res) => {
  try {
    // Fetch all options and populate the references
    const options = await Option.find()
      .populate('student', 'firstName lastName cin email') // Populate student details (name, email for example)
      .populate('academic_year', 'start_year end_year')
      .populate('period', 'name start_date end_date') // Populate academic year details (e.g., year, name)

    if (!options || options.length === 0) {
      return res.status(404).json({ message: 'No options found.' })
    }

    // Respond with the populated options
    res.status(200).json({ options })
  } catch (error) {
    console.error('Error fetching options:', error)
    res.status(500).json({
      message: 'An error occurred while fetching options.',
      error: error.message,
    })
  }
}

// Get Options by Student ID
export const getOptionsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params

    // Validate the student ID
    const studentExists = await Student.find({ _id: studentId })
    if (!studentExists) {
      return res.status(404).json({ message: 'Student not found.' })
    }

    // Fetch options associated with the student and populate the references
    const options = await Option.find({ student: studentId })
      .populate('student', 'firstName lastName cin email') // Populate student details (name, email for example)
      .populate('academic_year', 'start_year end_year')
      .populate('period', 'name start_date end_date') // Populate academic year details (e.g., year, name)

    if (!options || options.length === 0) {
      return res
        .status(404)
        .json({ message: `No options found for student with ID ${studentId}.` })
    }

    // Respond with the populated options
    res.status(200).json({ options })
  } catch (error) {
    console.error('Error fetching options by student ID:', error)
    res.status(500).json({
      message: 'An error occurred while fetching options by student ID.',
      error: error.message,
    })
  }
}
export const publishOrMaskOption = async (req, res) => {
  try {
    const { response } = req.params // 'true' ou 'false' pour publier ou masquer la liste d'option

    if (response !== 'true' && response !== 'false') {
      return res.status(400).json({
        success: false,
        message:
          'The value of "response" is invalid. It must be "true" or "false".',
      })
    }

    const isPublished = response === 'true'
    const optionBefore = await OptionResults.find({
      published: { $ne: isPublished },
    })

    if (optionBefore.length === 0) {
      return res.status(400).json({
        success: false,
        message: `All options are already ${isPublished ? 'published' : 'hidden'}. No update needed.`,
        model: optionBefore,
      })
    }

    // Mise à jour de toutes les options dont l'état est différent
    const result = await OptionResults.updateMany(
      { published: { $ne: isPublished } }, // Condition
      { $set: { published: isPublished } },
    )

    const optionAfter = await OptionResults.find({ published: isPublished })
    return res.status(200).json({
      success: true,
      message: `The options have been successfully ${isPublished ? 'published' : 'hidden'}.`,
      modelBefore: optionBefore,
      modelAfter: optionAfter,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error while publishing or hiding the options.',
      error: error.message,
    })
  }
}

export const calculateOptionResults = async (req, res) => {
  try {
    // Fetch all option submissions with students populated
    const options = await Option.find()
      .populate('student')
      .populate('academic_year')

    if (!options || options.length === 0) {
      return res.status(404).json({ message: 'No options found.' })
    }

    // Total number of students
    const totalOptions = options.length
    console.log('Total Options:', totalOptions)

    // Calculate the capacity split
    const inlogCapacity = Math.floor(totalOptions * 0.75) // 75% for INLOG
    const inrevCapacity = totalOptions - inlogCapacity // Remaining 25% for INREV

    console.log('INLOG Capacity:', inlogCapacity)
    console.log('INREV Capacity:', inrevCapacity)

    // Calculate the specific capacities for 1ing and concours spécifique
    const inrevCapacity1ing = Math.floor(inrevCapacity * 0.86) // 86% of INREV for 1ing
    const inrevCapacityConcours = inrevCapacity - inrevCapacity1ing // Remaining for concours

    const inlogCapacity1ing = Math.floor(inlogCapacity * 0.86) // 86% of INLOG for 1ing
    const inlogCapacityConcours = inlogCapacity - inlogCapacity1ing // Remaining for concours

    console.log('INREV Capacity for 1ing:', inrevCapacity1ing)
    console.log('INREV Capacity for Concours:', inrevCapacityConcours)
    console.log('INLOG Capacity for 1ing:', inlogCapacity1ing)
    console.log('INLOG Capacity for Concours:', inlogCapacityConcours)

    // Calculate scores for each option and student
    const results = options.map((option) => {
      const {
        student,
        name,
        generalAverage,
        webDevGrade,
        algorithmsGrade,
        oopGrade,
        academic_year, // Add academic_year here
      } = option

      // Calculate the score
      let score = 2 * generalAverage + webDevGrade + algorithmsGrade + oopGrade

      return {
        student,
        optionName: name,
        score,
        academic_year: academic_year._id, // Set academic year from option
      }
    })

    // Log the results array
    console.log('Calculated Results:', results)
    console.log('Results Array Length:', results.length)

    // Sort students by score in descending order
    results.sort((a, b) => b.score - a.score)

    // Log the sorted results
    console.log('Sorted Results:', results)

    // Assign students to options, respecting their preference and dynamic capacity
    const inrevResults = []
    const inlogResults = []
    const studentAssignments = {}

    // Log the initial arrays
    console.log('Initial INREV Results:', inrevResults)
    console.log('Initial INLOG Results:', inlogResults)

    // Assign students to options
    results.forEach((result) => {
      const { student, score, optionName, integrationYear, academic_year } =
        result

      console.log('Assigning student:', student._id, 'with score:', score)

      // Skip if already assigned
      if (studentAssignments[student._id]) {
        console.log('Student already assigned:', student._id)
        return
      }

      if (integrationYear === '1') {
        // Assign based on 1ing student preference
        if (optionName === 'INLOG' && inlogResults.length < inlogCapacity1ing) {
          inlogResults.push({
            student: student._id,
            optionName: 'INLOG',
            score,
            academic_year,
          })
          studentAssignments[student._id] = 'INLOG' // Assign to INLOG
        } else if (
          optionName === 'INREV' &&
          inrevResults.length < inrevCapacity1ing
        ) {
          inrevResults.push({
            student: student._id,
            optionName: 'INREV',
            score,
            academic_year,
          })
          studentAssignments[student._id] = 'INREV' // Assign to INREV
        } else {
          // If preferred option is full, assign to the other option
          if (inlogResults.length >= inlogCapacity1ing) {
            inlogResults.push({
              student: student._id,
              optionName: 'INREV',
              score,
              academic_year,
            })
            studentAssignments[student._id] = 'INREV'
          } else if (inrevResults.length >= inrevCapacity1ing) {
            inrevResults.push({
              student: student._id,
              optionName: 'INLOG',
              score,
              academic_year,
            })
            studentAssignments[student._id] = 'INLOG'
          }
        }
      } else {
        // Assign based on concours spécifique student preference
        if (
          optionName === 'INLOG' &&
          inlogResults.length < inlogCapacityConcours
        ) {
          inlogResults.push({
            student: student._id,
            optionName: 'INLOG',
            score,
            academic_year,
          })
          studentAssignments[student._id] = 'INLOG' // Assign to INLOG
        } else if (
          optionName === 'INREV' &&
          inrevResults.length < inrevCapacityConcours
        ) {
          inrevResults.push({
            student: student._id,
            optionName: 'INREV',
            score,
            academic_year,
          })
          studentAssignments[student._id] = 'INREV' // Assign to INREV
        } else {
          // If preferred option is full, assign to the other option
          if (inlogResults.length >= inlogCapacityConcours) {
            inlogResults.push({
              student: student._id,
              optionName: 'INREV',
              score,
              academic_year,
            })
            studentAssignments[student._id] = 'INREV'
          } else if (inrevResults.length > +inrevCapacityConcours) {
            inrevResults.push({
              student: student._id,
              optionName: 'INLOG',
              score,
              academic_year,
            })
            studentAssignments[student._id] = 'INLOG'
          }
        }
      }
    })

    // Assign ranks within INLOG and INREV independently
    inlogResults.sort((a, b) => b.score - a.score)
    inrevResults.sort((a, b) => b.score - a.score)

    inlogResults.forEach((result, index) => {
      result.rank = index + 1 // Rank starts at 1
    })

    inrevResults.forEach((result, index) => {
      result.rank = index + 1 // Rank starts at 1
    })

    // Store results in the OptionResults collection
    await OptionResults.deleteMany() // Clear previous results
    await OptionResults.insertMany(
      [...inlogResults, ...inrevResults].map((result) => ({
        student: result.student,
        optionName: result.optionName,
        score: result.score,
        rank: result.rank,
        academic_year: result.academic_year, // Store academic year in the result
      })),
    )

    // Respond with the final results
    res.status(201).json({
      message: 'Option results calculated and stored successfully.',
      inlogResults,
      inrevResults,
    })
  } catch (error) {
    console.error('Error calculating option results:', error)
    res.status(500).json({
      message: 'An error occurred while calculating option results.',
      error: error.message,
    })
  }
}
export const updateOptionResults = async (req, res) => {
  try {
    // Get the ID of the OptionResult to update
    const { optionResultId } = req.params

    // Get the new data from the request body (optionName, reason, valid)
    const { optionName, reason, valid } = req.body

    // Validate the input data (ensure optionName is valid)
    if (optionName && !['INREV', 'INLOG'].includes(optionName)) {
      return res
        .status(400)
        .json({ message: 'Invalid option name. It should be INREV or INLOG.' })
    }

    // If optionName is being modified, reason is required
    if (optionName && !reason) {
      return res.status(400).json({
        message: 'If you change the optionName, you must specify a reason.',
      })
    }

    // Find the OptionResult by ID
    const optionResult = await OptionResults.findById(optionResultId)
    if (!optionResult) {
      return res.status(404).json({ message: 'OptionResult not found.' })
    }

    // Track the old optionName for comparison
    const oldOptionName = optionResult.optionName

    // Update the OptionResult fields (only if provided in the request body)
    if (optionName) {
      optionResult.optionName = optionName
    }
    if (reason) {
      optionResult.reason = reason
    }
    if (valid !== undefined) {
      optionResult.valid = valid
    }

    // Update the modification date
    optionResult.dateOfModification = Date.now()

    // Save the updated OptionResult
    await optionResult.save()

    // Handle the dynamic re-ranking and array movement logic
    const allResults = await OptionResults.find() // Fetch all OptionResults
    const inlogResults = []
    const inrevResults = []

    // Reassign results to their respective arrays based on optionName
    allResults.forEach((result) => {
      if (result.optionName === 'INLOG') {
        inlogResults.push(result)
      } else if (result.optionName === 'INREV') {
        inrevResults.push(result)
      }
    })

    // Sort both arrays by score in descending order
    inlogResults.sort((a, b) => b.score - a.score)
    inrevResults.sort((a, b) => b.score - a.score)

    // Reassign ranks within each array
    inlogResults.forEach((result, index) => {
      result.rank = index + 1 // Rank starts at 1
    })
    inrevResults.forEach((result, index) => {
      result.rank = index + 1 // Rank starts at 1
    })

    // Save the updated ranks
    await Promise.all(
      [...inlogResults, ...inrevResults].map((result) => result.save()),
    )

    // Find the updated rank for the specific OptionResult
    let updatedRank
    if (optionResult.optionName === 'INLOG') {
      updatedRank = inlogResults.find((res) =>
        res._id.equals(optionResult._id),
      ).rank
    } else if (optionResult.optionName === 'INREV') {
      updatedRank = inrevResults.find((res) =>
        res._id.equals(optionResult._id),
      ).rank
    }

    // Update the rank in the updatedOptionResult response
    optionResult.rank = updatedRank

    // Respond with the updated OptionResult and the new arrays
    res.status(200).json({
      message: 'OptionResult updated successfully, and ranks recalculated.',
      updatedOptionResult: optionResult,
      inlogResults,
      inrevResults,
    })
  } catch (error) {
    console.error('Error updating option result:', error)
    res.status(500).json({
      message: 'An error occurred while updating the option result.',
      error: error.message,
    })
  }
}

export const getClassementByOption = async (req, res) => {
  try {
    // Get the option name from the request parameters (either INREV or INLOG)
    const { optionName } = req.params

    // Check if the optionName is valid (either INREV or INLOG)
    if (!['INREV', 'INLOG'].includes(optionName)) {
      return res
        .status(400)
        .json({ message: 'Invalid option name. It should be INREV or INLOG.' })
    }

    // Fetch the results for the specific option and populate the student details
    const optionResults = await OptionResults.find({ optionName })
      .populate('student') // Populate the student details
      .sort({ score: -1 }) // Sort by score in descending order

    if (!optionResults || optionResults.length === 0) {
      return res
        .status(404)
        .json({ message: `No results found for option ${optionName}.` })
    }

    // Map the results to return the student details, score, and rank
    const classement = optionResults.map((result, index) => ({
      student: {
        id: result.student._id, // Student ID
        firstName: result.student.firstName, // Student first name
        lastName: result.student.lastName, // Student last name
        cin: result.student.cin, // Student CIN
      },
      score: result.score,
      rank: index + 1, // Rank starts at 1
    }))

    // Respond with the ranking for the selected option
    res.status(200).json({
      message: `Classement for option ${optionName} fetched successfully.`,
      classement,
    })
  } catch (error) {
    console.error('Error fetching classement by option:', error)
    res.status(500).json({
      message: 'An error occurred while fetching classement by option.',
      error: error.message,
    })
  }
}
export const SentEmailFinalOption = async (req, res) => {
  try {
    const optionResult = await OptionResults.find({ published: true })
      .populate('student')
      .exec()
    if (!optionResult || optionResult.length === 0) {
      return res.status(404).json({ message: 'All options are hidden' })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'oumaymaamzoughi@gmail.com',
        pass: 'znvw qfty lltn sajs',
      },
    })
    const listOptionLink = `http://Options/Finallist`

    for (const result of optionResult) {
      const studentEmail = result.student.email
      const studentFullName = `${result.student.firstName || ''} ${result.student.lastName || ''}`

      const emailHtml = generateEmailTemplateOptionInfo(
        studentFullName,
        result.reason,
        listOptionLink,
      )

      const studentMailOptions = {
        from: 'oumaymaamzoughi@gmail.com',
        to: studentEmail,
        subject: result.reason
          ? 'Option Affectation Updated'
          : 'Option Affectation',
        html: emailHtml,
      }

      await transporter.sendMail(studentMailOptions)

      await OptionResults.findByIdAndUpdate(result._id, {
        $set: { sentEmail: true },
      })
    }

    console.log(optionResult)
    res.status(200).json({
      message: 'List of Final Option Results sent successfully.',
      model: optionResult,
    })
  } catch (error) {
    console.error('Error fetching Result Option:', error)
    res.status(500).json({
      message: 'An error occurred while fetching the option result.',
      error: error.message,
    })
  }
}
export const getFinalList = async (req, res) => {
  try {
    const studentId = req.auth.userId

    const optionResults = await OptionResults.find().populate('student').exec()

    if (optionResults.length === 0) {
      return res
        .status(404)
        .json({ message: 'Aucun résultat trouvé pour les options.' })
    }
    const finalList = optionResults.map((result) => {
      return {
        studentId: result.student._id,
        studentName: `${result.student.firstName} ${result.student.lastName}`,
        studentEmail: result.student.email,
        selectedOption: result.optionName,
        score: result.score,
        rank: result.rank,
      }
    })

    const studentChoice = optionResults.find(
      (optionResult) => optionResult.student._id.toString() === studentId,
    )
    let studentChoiceDetails = null
    if (studentChoice) {
      studentChoiceDetails = {
        studentId: studentChoice.student._id,
        studentName: `${studentChoice.student.firstName} ${studentChoice.student.lastName}`,
        selectedOption: studentChoice.optionName,
        score: studentChoice.score,
        rank: studentChoice.rank,
      }
    }

    res.status(200).json({
      message: 'Liste finale des options et des choix des étudiants.',
      FinalList: finalList,
      studentChoice: studentChoiceDetails,
    })
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des résultats d'option:",
      error,
    )
    res.status(500).json({
      message: 'Une erreur est survenue lors de la récupération des résultats.',
      error: error.message,
    })
  }
}

export function generateEmailTemplateOptionInfo(
  studentFullName,
  reason,
  listOptionLink,
) {
  let emailSubject = ''
  let studentEmailText = ''

  if (!reason) {
    studentEmailText = `Hello ${studentFullName.trim()},\n\nHere is your Option Affectation. Click on the link: ${listOptionLink}\n.`
    emailSubject = 'Option Affectation'
  } else {
    studentEmailText = `Hello ${studentFullName.trim()},\n\nYour option result has been modified for a reason. Click on the link: ${listOptionLink}\n.`
    emailSubject = 'Option Affectation Updated'
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
      body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f9;
          color: #333;
      }
      .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
          background-color: #0078d7;
          color: #fff;
          text-align: center;
          padding: 20px;
      }
      .header h1 {
          margin: 0;
          font-size: 1.8rem;
      }
      .content {
          padding: 20px;
          text-align: left;
      }
      .content p {
          margin: 0 0 15px;
          line-height: 1.6;
      }
      .content .highlight {
          color: #0078d7;
          font-weight: bold;
      }
      .footer {
          background-color: #f4f4f9;
          text-align: center;
          padding: 15px;
          font-size: 0.9rem;
          color: #666;
      }
      .footer img {
          display: block;
          margin: 10px auto;
          width: 65px;
          height: 50px;
      }
      .footer p {
          margin: 5px 0;
      }
      .black {
        color: #000;
      }
  </style>
</head>
<body>
  <div class="email-container">
      <div class="header">
          <h1>Option Affectation - ISAMM</h1>
      </div>
      <div class="content">
          <p class="black">Hello ${studentFullName.trim()},</p>
          <p class="black">${studentEmailText}</p>
          <p class="black">Best Regars.</p>
          <hr>
          <p class="black">L'équipe du système de gestion des options de l'ISAMM - <span style="font-size: 0.7rem; color: #666;">${new Date().toLocaleDateString()}</span></p>
      </div>
      <div class="footer">
          <img src="https://isa2m.rnu.tn/assets/img/logo-dark.png" alt="ISAMM Logo">
          <p>&copy; ISAMM Option Management System</p>
      </div>
  </div>
</body>
</html>`
}
