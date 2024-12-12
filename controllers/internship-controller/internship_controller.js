import Internship from '../../models/internship-models/internship_model.js'
import Document from '../../models/document-models/document_model.js'
import Period from '../../models/period-model/period_model.js'
import AcademicYear from '../../models/academic_year_models/academic-year-model.js'
import Student from '../../models/users-models/student_model.js'
import Teacher from '../../models/users-models/teacher_model.js'
import InternshipPlanning from '../../models/planning-models/Internship_planning.js'
import nodemailer from 'nodemailer'

// Add internship
export const addInternship = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      academicYear,
      studentId,
      title,
      level, // Added level here
      description,
    } = req.body

    const { type } = req.params // Extract type from URL parameters
    console.log('Type from URL:', type)

    // Validate required fields
    if (!academicYear || !studentId || !title || !description || !level) {
      return res.status(400).json({ message: 'Required fields are missing.' })
    }

    // Check if academic year exists
    const academicYearExists = await AcademicYear.findById(academicYear)
    if (!academicYearExists) {
      return res.status(404).json({ message: 'Academic Year not found.' })
    }

    // Check if student exists
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' })
    }

    // Find an open period matching the level
    const today = new Date()
    const openPeriods = await Period.find({
      name: 'Dépôt de stage',
      type: parseInt(type), // Ensure type matches level
      end_date: { $gte: new Date(today) }, // Ensure both are Date objects
    })

    console.log('Open periods found:', openPeriods) // Logging periods found

    if (openPeriods.length === 0) {
      return res
        .status(404)
        .json({ message: 'No open period matching the level found.' })
    }

    // Validate date range
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message:
          'Invalid date range. The end date must be after the start date.',
      })
    }

    // Check for overlapping internships
    const existingInternship = await Internship.findOne({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      studentId,
    })

    if (existingInternship) {
      return res.status(400).json({
        message:
          'An internship with the same date range already exists for this student.',
      })
    }

    // Determine status
    let status
    if (today > new Date(endDate)) {
      status = 'ended'
    } else if (today >= new Date(startDate)) {
      status = 'active'
    } else {
      status = 'pending'
    }

    // Create the internship
    const newInternship = await Internship.create({
      startDate,
      endDate,
      status,
      academicYear,
      studentId,
      title,
      level, // Added level here
      description,
      published: true, // Default value
      Validate: { value: false, reason: '' }, // Default values
      periodeId: openPeriods[0]._id, // Assign the first matched period
    })

    // Add internship to the student's internships array
    student.internships.push(newInternship._id)
    await student.save() // Save the updated student document

    res.status(201).json({
      model: newInternship,
      message:
        'Internship period successfully added and linked to the student!',
    })
  } catch (error) {
    console.error('Error during addInternship:', error)
    res
      .status(400)
      .json({ error: error.message, message: 'Error adding internship period' })
  }
}

// Update internship
export const updateInternship = async (req, res) => {
  try {
    const internshipId = req.params.id
    const {
      startDate,
      endDate,
      academicYear,
      studentId,
      periodeId,
      published,
      Validate,
      title,
      description,
      level, // Added level here for update
    } = req.body

    // Find the internship
    const existingInternship = await Internship.findById(internshipId)
    if (!existingInternship) {
      return res.status(404).json({ message: 'Internship not found' })
    }

    // Check if academic year exists
    if (academicYear) {
      const academicYearExists = await AcademicYear.findById(academicYear)
      if (!academicYearExists) {
        return res.status(404).json({ message: 'Academic Year not found.' })
      }
    }

    // Check if student exists
    if (studentId) {
      const student = await Student.findById(studentId)
      if (!student) {
        return res.status(404).json({ message: 'Student not found.' })
      }
    }

    // Fetch the period to validate its name and endDate
    const period = await Period.findById(
      periodeId || existingInternship.periodeId,
    )
    if (!period) {
      return res.status(404).json({ message: 'Period not found.' })
    }

    if (period.name !== 'Dépôt de stage') {
      return res
        .status(400)
        .json({ message: 'The period name must be "Dépôt de stage".' })
    }

    if (new Date() > new Date(period.endDate)) {
      return res
        .status(400)
        .json({ message: 'The submission period has ended.' })
    }

    // Validate date range
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message:
          'Invalid date range. The end date must be after the start date.',
      })
    }

    // Update fields
    if (startDate) existingInternship.startDate = new Date(startDate)
    if (endDate) existingInternship.endDate = new Date(endDate)
    if (academicYear) existingInternship.academicYear = academicYear
    if (studentId) existingInternship.studentId = studentId
    if (title) existingInternship.title = title
    if (description) existingInternship.description = description
    if (published !== undefined) existingInternship.published = published
    if (Validate) existingInternship.Validate = Validate
    if (periodeId) existingInternship.periodeId = periodeId
    if (level !== undefined) existingInternship.level = level // Update level here

    // Recalculate status
    const today = new Date()
    if (today > new Date(existingInternship.endDate)) {
      existingInternship.status = 'ended'
    } else if (today >= new Date(existingInternship.startDate)) {
      existingInternship.status = 'active'
    } else {
      existingInternship.status = 'pending'
    }

    // Save updates
    await existingInternship.save()

    res.status(200).json({
      model: existingInternship,
      message: 'Internship successfully updated!',
    })
  } catch (error) {
    console.error('Error during updateInternship:', error)
    res
      .status(400)
      .json({ error: error.message, message: 'Error updating internship' })
  }
}

export const getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find()

    res.status(200).json({
      models: internships,
      message: 'Internship periods retrieved successfully!',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Error retrieving internship periods',
    })
  }
}

export const getInternshipById = async (req, res) => {
  try {
    const internshipId = req.params.id

    const singleInternship = await Internship.findById(internshipId)
      .populate('academicYear')
      .populate('studentId', '-password') // Exclude the password field
      .populate('periodeId')

    if (!singleInternship) {
      return res.status(404).json({ message: 'Internship period not found' })
    }

    res.status(200).json({
      model: singleInternship,
      message: 'Internship period retrieved successfully!',
    })
  } catch (error) {
    console.error('Error retrieving internship:', error)
    res.status(400).json({
      error: error.message,
      message: 'Error retrieving internship period',
    })
  }
}

export const deleteInternship = async (req, res) => {
  try {
    const internshipId = req.params.id

    // Check if the internship exists
    const existingInternship = await Internship.findById(internshipId)
    if (!existingInternship) {
      return res.status(404).json({ message: 'Internship period not found' })
    }

    // Delete the internship
    await Internship.findByIdAndDelete(internshipId)

    // Delete all documents related to the internship
    await Document.deleteMany({ internship: internshipId })

    // Remove the internshipId from all students' internships array
    await Student.updateMany(
      { internships: internshipId }, // Find students who have this internship
      { $pull: { internships: internshipId } }, // Remove the internshipId from their internships array
    )

    res.status(200).json({
      message:
        'Internship period and related documents successfully deleted, and student records updated!',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Error deleting internship period',
    })
  }
}
export const assignTeachersToInternship = async (req, res) => {
  const { teacherIds } = req.body // Teacher IDs come from the request body
  const { type } = req.params // Use 'type' if you have defined ':type' in the route
  const level = Number(type) // Convert 'type' to a number

  console.log('level after conversion:', level) // Check if the conversion was successful

  if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'teacherIds must be a non-empty array.',
    })
  }

  try {
    // Step 1: Retrieve internships by level
    const internships = await getInternshipsByLevel(level)

    if (internships.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No internships found for level ${level}.`,
      })
    }

    const teacherSubjectCounts = await fetchTeacherSubjectCounts(teacherIds)

    // Sort the teachers by subject count
    const sortedTeachers = teacherSubjectCounts.data.sort(
      (a, b) => b.subjectCount - a.subjectCount,
    )

    // Step 3: Distribute internships among the teachers
    let assignments = []
    let teacherIndex = 0

    // Filter unassigned internships
    const unassignedInternships = []
    for (let i = 0; i < internships.length; i++) {
      const internship = internships[i]
      const isAssigned = await isInternshipAssigned(internship._id)

      // If the internship is already assigned, we do not add it to the unassigned list
      if (!isAssigned) {
        unassignedInternships.push(internship)
      }
    }

    // Check if we have any unassigned internships
    if (unassignedInternships.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No unassigned internships available for this level.',
      })
    }

    // Distribute the unassigned internships among the teachers
    for (let i = 0; i < unassignedInternships.length; i++) {
      const internship = unassignedInternships[i]
      const teacher = sortedTeachers[teacherIndex]

      // Assign the internship
      const planning = new InternshipPlanning({
        idInternship: internship._id, // Internship
        EvaluatorId: teacher.teacherId, // Teacher
        published: false, // By default, unpublished
      })

      // Save the planning in the InternshipPlanning collection
      const savedPlanning = await planning.save()
      assignments.push(savedPlanning)

      // Move to the next teacher (cycle through the teachers)
      teacherIndex = (teacherIndex + 1) % sortedTeachers.length // Repeat the teacher loop
    }

    // Return the response with the successful assignments
    return res.status(200).json({
      success: true,
      message: `${assignments.length} internships successfully assigned to teachers.`,
      data: assignments,
    })
  } catch (err) {
    console.error('Error assigning internships:', err)
    return res.status(500).json({
      success: false,
      message: 'Error assigning internships.',
      error: err.message,
    })
  }
}

export const fetchAllPlanning = async (req, res) => {
  try {
    // Retrieve all planning entries and populate the relationships (internship and teacher)
    const planning = await InternshipPlanning.find()
      .populate({
        path: 'idInternship',
        populate: {
          path: 'studentId',
        },
      }) // Populate internship details
      .populate('EvaluatorId') // Populate teacher details

    if (!planning || planning.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No planning found.',
      })
    }
    res.status(200).json({
      message: 'Planning retrieved successfully.',
      data: planning,
    })
  } catch (error) {
    console.error('Error fetching planning:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error fetching planning.',
      error: error.message,
    })
  }
}

export const updateInternshipPlanning = async (req, res) => {
  try {
    const { idInternship, idTeacher } = req.body // Internship and teacher ID
    const type = Number(req.params.type) // Type of internship (1 or 2), converted to number

    // Check if the internship type is valid (1 or 2)
    if (![1, 2].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid internship type. Must be 1 or 2.',
      })
    }

    // Check if the internship exists
    const internship = await Internship.findById(idInternship)
    if (!internship) {
      return res
        .status(404)
        .json({ success: false, message: 'Internship not found.' })
    }

    // Check if the internship type matches the specified one
    if (internship.level !== type) {
      return res.status(400).json({
        success: false,
        message: `Internship type mismatch. Expected ${type}, but found ${internship.level}.`,
      })
    }

    // Check if the teacher exists
    const teacher = await Teacher.findById(idTeacher)
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: 'Teacher not found.' })
    }

    // Check if an assignment for this internship already exists
    const isAssigned = await isInternshipAssigned(idInternship)

    if (isAssigned) {
      // If an internship planning already exists, update the teacher
      const existingInternshipPlanning = await InternshipPlanning.findOne({
        idInternship,
      })

      // If the teacher in the planning is already the same, no update is needed
      if (existingInternshipPlanning.EvaluatorId.equals(idTeacher)) {
        return res.status(400).json({
          success: false,
          message:
            'The teacher in the planning is already the same. No update is needed.',
        })
      }

      existingInternshipPlanning.EvaluatorId = idTeacher // Update the teacher ID

      // Save the updated assignment
      await existingInternshipPlanning.save()

      return res.status(200).json({
        message: 'Teacher successfully updated for the internship.',
        model: existingInternshipPlanning,
      })
    } else {
      // If no planning exists, create a new planning for this internship
      const newInternshipPlanning = new InternshipPlanning({
        idInternship,
        EvaluatorId: idTeacher, // Assign the teacher to the internship
        published: false,
      })

      // Save the new planning
      await newInternshipPlanning.save()

      return res.status(200).json({
        message: 'Teacher successfully assigned to the internship.',
        model: newInternshipPlanning,
      })
    }
  } catch (error) {
    console.error('Error assigning teacher to internship:', error)
    return res.status(500).json({
      success: false,
      message: 'Error assigning teacher to internship.',
      error: error.message,
    })
  }
}

export const publishOrMaskPlanning = async (req, res) => {
  try {
    const { type } = req.params // '1' ou '2' (niveau de stage)
    const { response } = req.params // 'true' ou 'false' pour publier ou masquer le planning

    // Valider la valeur du paramètre response
    if (response !== 'true' && response !== 'false') {
      return res.status(400).json({
        success: false,
        message:
          'La valeur de "response" est invalide. Elle doit être "true" ou "false".',
      })
    }

    // Convertir la réponse en booléen
    const isPublished = response === 'true'

    // Utiliser getInternshipsByLevel pour récupérer les stages par niveau
    let internships
    try {
      internships = await getInternshipsByLevel(type)
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }

    // Vérifier si tous les plannings sont déjà dans l'état souhaité
    const internshipPlannings = await Promise.all(
      internships.map(async (internship) => {
        return await InternshipPlanning.findOne({
          idInternship: internship._id,
        })
      }),
    )

    const allPlanningsAreAlready = internshipPlannings.every(
      (planning) => planning.published === isPublished,
    )

    if (allPlanningsAreAlready) {
      return res.status(200).json({
        success: true,
        message: isPublished
          ? `Les plannings de stage pour le niveau ${type} sont déjà publiés.`
          : `Les plannings de stage pour le niveau ${type} sont déjà masqués.`,
      })
    }

    // Mettre à jour l'état des plannings
    for (const internship of internships) {
      const internshipPlanning = await InternshipPlanning.findOne({
        idInternship: internship._id,
      })

      if (internshipPlanning) {
        // Mettre à jour l'état de publication
        internshipPlanning.published = isPublished

        // Sauvegarder le planning mis à jour
        await internshipPlanning.save()
      }
    }

    // Retourner une réponse de succès
    return res.status(200).json({
      success: true,
      message: isPublished
        ? `Les plannings de stage pour le niveau ${type} ont été publiés avec succès.`
        : `Les plannings de stage pour le niveau ${type} ont été masqués avec succès.`,
    })
  } catch (error) {
    console.error('Erreur dans publishOrMaskPlanning:', error)
    return res.status(500).json({
      success: false,
      message:
        'Erreur lors de la publication ou du masquage des plannings de stage.',
      error: error.message,
    })
  }
}
export const publishOrMaskPlanningById = async (req, res) => {
  try {
    const { type, response, id } = req.params // 'type' (internship level), 'response' (true or false), and 'id' (planning ID)

    // Validate the 'response' parameter (true or false)
    if (response !== 'true' && response !== 'false') {
      return res.status(400).json({
        success: false,
        message:
          'The value of "response" is invalid. It must be "true" or "false".',
      })
    }

    // Convert 'response' to a boolean
    const isPublished = response === 'true'

    // Check if the planning ID is provided and valid
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'The planning ID is required.',
      })
    }

    // Use the planning ID to retrieve the specific internship planning with the internship type
    const internshipPlanning =
      await InternshipPlanning.findById(id).populate('idInternship') // Search by ID in the InternshipPlanning collection
    if (!internshipPlanning) {
      return res.status(404).json({
        success: false,
        message: 'Internship planning not found.',
      })
    }

    // Check if 'type' is a valid number and convert it
    const parsedType = parseInt(type)
    if (isNaN(parsedType)) {
      return res.status(400).json({
        success: false,
        message: `The specified type (${type}) is not a valid number.`,
      })
    }

    // Check if the internship ID corresponds to the level (type) passed in the URL
    if (internshipPlanning.idInternship.level !== parsedType) {
      return res.status(400).json({
        success: false,
        message: `The internship in this planning does not have the specified level (${type}).`,
      })
    }

    // Check if the planning is already in the desired state (published or masked)
    if (internshipPlanning.published === isPublished) {
      return res.status(200).json({
        success: true,
        message: isPublished
          ? `The internship planning for this level is already published.`
          : `The internship planning for this level is already hidden.`,
        model: internshipPlanning,
      })
    }

    // Update the planning state (published or hidden)
    internshipPlanning.published = isPublished

    // Save the updated planning
    await internshipPlanning.save()

    // Return a success response
    return res.status(200).json({
      success: true,
      message: isPublished
        ? `The internship planning for level ${type} has been successfully published.`
        : `The internship planning for level ${type} has been successfully hidden.`,
      model: internshipPlanning,
    })
  } catch (error) {
    console.error('Error in publishOrMaskPlanning:', error)
    return res.status(500).json({
      success: false,
      message:
        'Error occurred while publishing or masking the internship planning.',
      error: error.message,
    })
  }
}

export const sendInternshipPlanningEmail = async (req, res) => {
  const { type } = req.params // Extract the type (level) from the URL parameters

  // Generate the link to the planning (replace with actual link generation logic)
  const levelNumber = parseInt(type, 10)

  if (isNaN(levelNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid level parameter, must be a number.',
    })
  }
  try {
    // Create an empty array to store the matching plans
    let planningByType = []
    const Plannings = await InternshipPlanning.find()
      .populate({
        path: 'idInternship',
        populate: {
          path: 'studentId',
        },
      }) // Populate internship details
      .populate('EvaluatorId')
      .exec() // Populate teacher details

    // Loop through the Plannings array
    for (let i = 0; i < Plannings.length; i++) {
      // Access the current planning item
      const currentPlanning = Plannings[i]

      // Check if the level==levelNumber and planning published not masked
      if (
        currentPlanning.idInternship.level === levelNumber &&
        currentPlanning.published === true
      ) {
        // Add the current planning to the planningByType array
        planningByType.push(currentPlanning)
      }
    }

    // Extract emails
    const emails = planningByType.map((planning) => {
      const studentEmail =
        planning.idInternship.studentId?.email || 'No student email'
      const evaluatorEmail = planning.EvaluatorId?.email || 'No evaluator email'
      return { studentEmail, evaluatorEmail }
    })

    // unique array of evaluators email
    const uniqueEvaluatorEmails = [
      ...new Set(emails.map((email) => email.evaluatorEmail)),
    ]

    // Combine evaluators email  and Students email
    const allEmails = emails
      .map((email) => email.studentEmail)
      .concat(uniqueEvaluatorEmails)

    // Configure the email transporter with Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'oumaymaamzoughi@gmail.com', // Sender's email address
        pass: 'znvw qfty lltn sajs', // Sender's email password
      },
    })
    /*// Options de l'email
    const mailOptions = {
      from: 'oumaymaamzoughi@gmail.com', // Expéditeur
      to: 'siwarlab01@gmail.com',  // Destinataire
      subject: `Internship Planning for ${type} year`,  // Sujet de l'email
      text: `Hello,\n\nHere is the link to the internship planning for the ${type} year: ${planningLink}\n\nBest regards.`,  // Contenu de l'email
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);
    */

    // Define the subject and text of the email
    const subject = 'Internship Planning Notification'
    const planningLink = `http://example.com/planning` // Example link, replace with actual one
    const text = `Hello,\n\nHere is the link to the internship planning: ${planningLink}\n\nBest regards.`

    // Loop through the email list and send an email to each
    for (const email of allEmails) {
      if (email !== 'No student email' && email !== 'No evaluator email') {
        const mailOptions = {
          from: 'oumaymaamzoughi@gmail.com', // Sender's email address
          to: email, // Recipient's email
          subject: subject,
          text: text,
        }

        // Send the email
        await transporter.sendMail(mailOptions)
      }
    }
    return res
      .status(200)
      .json({ success: true, message: 'Test email sent successfully.' })
  } catch (error) {
    console.error('Error details:', error) // Log full error details
    return res.status(500).json({
      error: `An error occurred while sending the email: ${error.message}`,
    })
  }
}

// Function to retrieve all internships assigned to the teacher
export const getAssignedInternshipTeacher = async (req, res) => {
  try {
    // Retrieve the teacher's ID from the token
    const teacherId = req.auth.userId // Ensure that req.auth.id is correctly populated by your middleware
    console.log('Teacher ID:', teacherId)

    // Retrieve all internship plannings where the teacher is assigned
    const plannings = await InternshipPlanning.find({ EvaluatorId: teacherId })
      .populate('idInternship') // Populate the internship details
      .exec()

    // If no plannings are found for the teacher
    if (plannings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No internships assigned to this teacher.',
      })
    }

    // If internships are found, return the internships in the response
    return res.status(200).json({
      success: true,
      model: plannings.map((planning) => ({
        internship: planning.idInternship, // Internship details
      })),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Error retrieving assigned internships.',
    })
  }
}

//first fnct
export const getInternshipsByLevel = async (level) => {
  const levelNumber = parseInt(level, 10)
  if (isNaN(levelNumber)) {
    throw new Error('Invalid level parameter, must be a number.')
  }

  const internships = await Internship.find({ level: levelNumber })
  if (internships.length === 0) {
    throw new Error(`No internships found for level ${levelNumber}.`)
  }

  return internships
}

export const fetchInternshipsByType = async (req, res) => {
  try {
    const level = req.params.type
    const internships = await getInternshipsByLevel(level)
    res.status(200).json({ model: internships, message: 'Succès' })
  } catch (err) {
    console.error('Error in fetchInternshipsByType:', err)
    res.status(500).json({ error: err.message })
  }
}
// 2nd fnct
export const fetchTeacherSubjectCounts = async (teacherIds) => {
  if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
    throw new Error('teacherIds must be a non-empty array.')
  }

  try {
    const teachers = await Teacher.find({ _id: { $in: teacherIds } }).populate(
      'subjects',
    )
    const teacherSubjectCounts = teachers.map((teacher) => ({
      teacherId: teacher._id,
      subjectCount: teacher.subjects.length,
    }))

    return { success: true, data: teacherSubjectCounts }
  } catch (err) {
    console.error('Error fetching teacher subject counts:', err)
    return {
      success: false,
      message: 'Failed to fetch teacher subject counts.',
      error: err.message,
    }
  }
}
export const teachernbsubject = async (req, res) => {
  const { teacherIds } = req.body

  if (!teacherIds) {
    return res.status(400).json({ error: 'teacherIds is required.' })
  }

  try {
    const result = await fetchTeacherSubjectCounts(teacherIds)
    res.status(200).json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch teacher subject counts.',
      message: err.message,
    })
  }
}
// to verify if  the internship is assigned
const isInternshipAssigned = async (internshipId) => {
  try {
    const existingPlanning = await InternshipPlanning.findOne({
      idInternship: internshipId,
    })
    return existingPlanning !== null // Retourne true si le stage est déjà assigné, sinon false
  } catch (err) {
    console.error('Error checking internship assignment:', err)
    throw new Error('Error checking internship assignment.')
  }
}
