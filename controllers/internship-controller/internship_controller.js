import Internship from '../../models/internship-models/internship_model.js'
import Document from '../../models/document-models/document_model.js'
import Period from '../../models/period-model/period_model.js'
import AcademicYear from '../../models/academic_year_models/academic-year-model.js'
import Student from '../../models/users-models/student_model.js'
import Teacher from '../../models/users-models/teacher_model.js'
import InternshipPlanning from '../../models/planning-models/Internship_planning.js'
import nodemailer from 'nodemailer'
import { getTeacher } from '../../services/teachers_services.js'
import { internshipPlanningValidator } from '../../validators/internshipPlanning_validator.js'

export const addInternship = async (req, res) => {
  try {
    const { startDate, endDate, academicYear, title, level, description } =
      req.body

    const studentId = req.auth.userId // Extract student ID from the token
    const { type } = req.params // Extract type from URL parameters

    // Validate required fields
    if (!academicYear || !title || !description || !level) {
      return res.status(400).json({ message: 'Required fields are missing.' })
    }

    // Check if academic year exists
    const academicYearExists = await AcademicYear.findById(academicYear)
    if (!academicYearExists) {
      return res.status(404).json({ message: 'Academic Year not found.' })
    }
    if (level.toString() !== type) {
      return res.status(400).json({
        message: `Different types cannot be submitted. Level: ${level}, Type: ${type}`,
      })
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
      end_date: { $gte: new Date(today) },
    })

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

    // Handle uploaded files
    const documentPaths = req.files.map((file) => file.path) // Extract file paths

    // Create the internship
    const newInternship = await Internship.create({
      startDate,
      endDate,
      status,
      academicYear,
      studentId,
      title,
      level,
      description,
      published: true,
      Validate: { value: false, reason: '' },
      periodeId: openPeriods[0]._id,
      documents: documentPaths, // Save file paths in the documents array
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
    const internshipId = req.params.id // Internship ID from the route
    const userId = req.auth.userId // Extract user ID from the token
    const userRole = req.auth.role // Assuming `role` is part of the user data
    const {
      startDate,
      endDate,
      academicYear,
      title,
      level,
      description,
      Validate,
      published,
    } = req.body

    // Find the internship
    const existingInternship = await Internship.findById(internshipId)
    if (!existingInternship) {
      return res.status(404).json({ message: 'Internship not found' })
    }

    // Check if the user is a student or teacher
    const isStudent = userRole === 'student'
    const isTeacher = userRole === 'teacher'

    // If the user is a student, they can't update the 'Validate' field
    if (isStudent && Validate !== undefined) {
      return res.status(403).json({
        message: 'Students cannot update the Validate field.',
      })
    }

    // If the user is a teacher, they can only update the 'Validate' field
    if (
      isTeacher &&
      (startDate ||
        endDate ||
        academicYear ||
        title ||
        level ||
        description ||
        published)
    ) {
      return res.status(403).json({
        message: 'Teachers can only update the Validate field.',
      })
    }

    // Fetch Internship Planning to check if the teacher is the evaluator
    if (isTeacher && Validate !== undefined) {
      const internshipPlanning = await InternshipPlanning.findOne({
        idInternship: internshipId,
      })

      // Log internship planning details and the IDs for debugging
      if (internshipPlanning) {
        console.log('Internship Planning found:', internshipPlanning)
        console.log('Logged-in Teacher ID (userId):', userId)
        console.log(
          'Evaluator ID from Internship Planning:',
          internshipPlanning.EvaluatorId.toString(),
        )
      } else {
        console.log(
          'Internship Planning not found for internshipId:',
          internshipId,
        )
      }

      if (!internshipPlanning) {
        return res
          .status(404)
          .json({ message: 'Internship Planning not found' })
      }

      // Check if the teacher is the evaluator
      if (internshipPlanning.EvaluatorId.toString() !== userId) {
        return res.status(403).json({
          message: 'You are not authorized to validate this internship.',
        })
      }

      // If the teacher is authorized, update the 'Validate' field
      existingInternship.Validate = Validate
    }

    // Validate date range if both startDate and endDate are provided
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message:
          'Invalid date range. The end date must be after the start date.',
      })
    }

    // Check if academic year exists if provided
    if (academicYear) {
      const academicYearExists = await AcademicYear.findById(academicYear)
      if (!academicYearExists) {
        return res.status(404).json({ message: 'Academic Year not found.' })
      }
    }

    // Handle uploaded files and append them to the documents array
    const documentPaths = req.files ? req.files.map((file) => file.path) : []
    if (documentPaths.length > 0) {
      existingInternship.documents.push(...documentPaths) // Append new documents
    }

    // Update fields based on user role
    if (isStudent) {
      // Students can update everything except Validate
      if (startDate) existingInternship.startDate = new Date(startDate)
      if (endDate) existingInternship.endDate = new Date(endDate)
      if (academicYear) existingInternship.academicYear = academicYear
      if (title) existingInternship.title = title
      if (description) existingInternship.description = description
      if (level !== undefined) existingInternship.level = level
      if (published !== undefined) existingInternship.published = published
    }

    // Recalculate status based on dates
    const today = new Date()
    if (today > new Date(existingInternship.endDate)) {
      existingInternship.status = 'ended'
    } else if (today >= new Date(existingInternship.startDate)) {
      existingInternship.status = 'active'
    } else {
      existingInternship.status = 'pending'
    }

    // Save the updated internship
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
    const internships = await Internship.find().populate(
      'studentId',
      'firstName lastName email cin',
    ) // Populate with specific student info

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
      .populate('studentId', 'firstName lastName email cin') // Populate student details
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

    const teacherArray = teacherSubjectCounts.data.map((teacher) => ({
      teacherId: teacher.teacherId.toString(),
      subjectCount: Number(teacher.subjectCount),
    }))

    // Calculate the total number of subjects
    const totalSubjects = teacherArray.reduce(
      (sum, teacher) => sum + teacher.subjectCount,
      0,
    )

    if (totalSubjects === 0) {
      return res.status(400).json({
        success: false,
        message: "Les enseignants n'ont pas de matières attribuées.",
      })
    }

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
    // Step 4: Calculate the remaining quota for each teacher based on their subject count
    const teacherAssignments = teacherArray.map((teacher) => ({
      teacherId: teacher.teacherId,
      remainingQuota: Math.round(
        (teacher.subjectCount / totalSubjects) * unassignedInternships.length,
      ),
      assignedInternship: 0,
    }))

    console.log('Teacher Assignments before sorting:', teacherAssignments)

    // Sort teachers by remainingQuota in ascending order
    teacherAssignments.sort((a, b) => a.remainingQuota - b.remainingQuota)

    console.log('Teacher Assignments after sorting:', teacherAssignments)

    // Distribute the unassigned internships among the teachers
    let assignments = []
    for (let i = 0; i < unassignedInternships.length; i++) {
      const internship = unassignedInternships[i]

      let assigned = false

      for (let j = 0; j < teacherAssignments.length; j++) {
        const teacher = teacherAssignments[j]

        if (teacher.remainingQuota > 0) {
          // Assign the internship
          const planning = new InternshipPlanning({
            idInternship: internship._id, // Internship
            EvaluatorId: teacher.teacherId, // Teacher
            published: false, // By default, unpublished
            sentEmail: false,
            sentAt: null,
          })

          // Save the planning in the InternshipPlanning collection
          const savedPlanning = await planning.save()
          assignments.push(savedPlanning)
          // Réduire le nombre de matières restantes pour cet enseignant
          teacher.remainingQuota--
          teacher.assignedInternship++

          assigned = true
          break
        }
      }
      if (!assigned) {
        console.log(
          `Could not assign internship ${internship._id}. All teachers have reach their quota`,
        )
      }
    }

    // Return the response with the successful assignments
    return res.status(200).json({
      success: true,
      message: `${assignments.length} internships successfully assigned to teachers !! All teachers have reach their quota .`,
      data: {
        assignments,
        teacherAssignments,
      },
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
      .populate('academicyear')

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
  const { type } = req.params

  const levelNumber = parseInt(type, 10)

  if (isNaN(levelNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid level parameter, must be a number.',
    })
  }
  try {
    let planningByType = []
    const Plannings = await InternshipPlanning.find()
      .populate({
        path: 'idInternship',
        populate: {
          path: 'studentId',
        },
      })
      .populate('EvaluatorId')
      .exec()

    for (let i = 0; i < Plannings.length; i++) {
      const currentPlanning = Plannings[i]

      if (
        currentPlanning.idInternship.level === levelNumber &&
        currentPlanning.published === true
      ) {
        planningByType.push(currentPlanning)
      }
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'oumaymaamzoughi@gmail.com', // Sender's email address
        pass: 'znvw qfty lltn sajs', // Sender's email password
      },
    })

    // Parcourir les plannings et envoyer les emails
    for (let i = 0; i < planningByType.length; i++) {
      const planning = planningByType[i]

      // Extraire les emails de l'étudiant et de l'enseignant

      const studentEmail = planning.idInternship.studentId?.email
      const evaluatorEmail = planning.EvaluatorId?.email
      const StudentFullName = `${planning.idInternship.studentId?.firstName || ''} ${planning.idInternship.studentId?.lastName || ''}`
      const planningLink = `http://Internship.com/planning`
      // Envoi à l'étudiant
      if (studentEmail) {
        if (!planning.sentEmail) {
          // 1er envoi à l'étudiant
          const studentEmailText = `Hello ${StudentFullName.trim()},\n\nHere is your internship planning link: ${planningLink}\n\nBest regards.`
          const studentMailOptions = {
            from: 'oumaymaamzoughi@gmail.com',
            to: studentEmail,
            subject: 'Internship Planning First Notification',
            text: studentEmailText,
          }

          await transporter.sendMail(studentMailOptions)
          // Mettre à jour le planning pour le 1er envoi
          await InternshipPlanning.findByIdAndUpdate(planning._id, {
            $set: {
              sentEmail: true,
              sentAt: new Date(),
            },
          })
        } else {
          // 2ème envoi à l'étudiant si l'email a déjà été envoyé
          const studentEmailText = `Hello again ${StudentFullName.trim()},\n\nThis is a reminder with your internship planning link: ${planningLink}\n\nBest regards.`
          const studentMailOptions = {
            from: 'oumaymaamzoughi@gmail.com',
            to: studentEmail,
            subject: 'Internship Planning Reminder',
            text: studentEmailText,
          }

          await transporter.sendMail(studentMailOptions)
          // Mettre à jour la date d'envoi pour le 2ème envoi
          await InternshipPlanning.findByIdAndUpdate(planning._id, {
            $set: {
              sentAt: new Date(),
            },
          })
        }
      }

      // Envoi à l'enseignant
      if (evaluatorEmail) {
        const EvaluatorFullName = `${planning.EvaluatorId?.firstName || ''} ${planning.EvaluatorId?.lastName || ''}`
        if (!planning.sentEmail) {
          // 1er envoi à l'enseignant
          const evaluatorEmailText = `Hello ${EvaluatorFullName.trim()},\n\nHere is the internship planning link for your student ${StudentFullName.trim()}: ${planningLink}\n\nBest regards.`
          const evaluatorMailOptions = {
            from: 'oumaymaamzoughi@gmail.com',
            to: evaluatorEmail,
            subject: 'Internship Planning First Notification',
            text: evaluatorEmailText,
          }

          await transporter.sendMail(evaluatorMailOptions)
          // Mettre à jour le planning pour le 1er envoi
          await InternshipPlanning.findByIdAndUpdate(planning._id, {
            $set: {
              sentEmail: true,
              sentAt: new Date(),
            },
          })
        } else {
          // 2ème envoi à l'enseignant si l'email a déjà été envoyé
          const evaluatorEmailText = `Hello again ${EvaluatorFullName.trim()},\n\nThis is a reminder with the internship planning link for your student ${StudentFullName.trim()}: ${planningLink}\n\nBest regards.`
          const evaluatorMailOptions = {
            from: 'oumaymaamzoughi@gmail.com',
            to: evaluatorEmail,
            subject: 'Internship Planning Reminder',
            text: evaluatorEmailText,
          }

          await transporter.sendMail(evaluatorMailOptions)
          // Mettre à jour la date d'envoi pour le 2ème envoi
          await InternshipPlanning.findByIdAndUpdate(planning._id, {
            $set: {
              sentAt: new Date(),
            },
          })
        }
      }
    }

    // Réponse à la fin de l'envoi
    return res
      .status(200)
      .json({ success: true, message: 'Emails sent successfully.' })
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
    const teacherId = req.auth.userId
    console.log('Teacher ID:', teacherId)

    // Retrieve all internship plannings where the teacher is assigned
    const plannings = await InternshipPlanning.find({ EvaluatorId: teacherId })
      .populate({
        path: 'idInternship',
        populate: {
          path: 'studentId',
        },
      }) // Populate the internship details
      .exec()

    // If no plannings are found for the teacher
    if (plannings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No internships assigned to this teacher.',
      })
    }

    return res.status(200).json({
      success: true,
      model: plannings.map((planning) => ({
        internship: planning.idInternship,
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

export const updatePlanningSoutenance = async (req, res) => {
  const { type, id } = req.params
  const { date, horaire, LienGoogleMeet } = req.body
  const teacherId = req.auth.userId

  // Validation des données
  const { error } = internshipPlanningValidator.validate(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message })
  }
  //test For level matching
  const internship = await Internship.findOne({
    level: type,
  })
  if (!internship) {
    console.log('the level does not match.')
    return
  }

  try {
    const planning = await InternshipPlanning.findOneAndUpdate(
      {
        idInternship: id,
        EvaluatorId: teacherId,
      },
      {
        $set: {
          'meeting.date': new Date(date),
          'meeting.time': horaire,
          'meeting.googleMeetLink': LienGoogleMeet,
        },
      },
      { new: true, upsert: false }, // Return updated document, do not create a new one
    )
      .populate({
        path: 'idInternship',
        populate: {
          path: 'studentId',
        },
      })
      .populate('EvaluatorId')
      .exec()

    if (!planning) {
      return res.status(403).json({
        success: false,
        message: `You are not assigned to this internship`,
      })
    }

    //Send Email to Student

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'oumaymaamzoughi@gmail.com', // Sender's email address
        pass: 'znvw qfty lltn sajs', // Sender's email password
      },
    })
    const studentEmail = planning.idInternship.studentId.email
    const StudentFullName = `${planning.idInternship.studentId?.firstName || ''} ${planning.idInternship.studentId?.lastName || ''}`
    const EvaluatorFullName = `${planning.EvaluatorId.firstName || ''} ${planning.EvaluatorId.lastName || ''}`
    console.log(studentEmail)
    console.log(StudentFullName)
    console.log(EvaluatorFullName)

    const mailOptions = {
      from: 'oumaymaamzoughi@gmail.com',
      replyTo: planning.EvaluatorId.email,
      to: studentEmail,
      subject: `Internship Meeting Scheduled with Sir/Madam ${EvaluatorFullName}`,
      text: `Dear ${StudentFullName},\n\nYour internship  meeting has been scheduled.\n\nDetails:\nDate: ${date}\nTime: ${horaire}\nGoogle Meet Link: ${LienGoogleMeet}\n\nBest regards,`,
    }
    await transporter.sendMail(mailOptions)

    return res.status(200).json({
      success: true,
      message: `Meeting details updated and email sent to the student.`,
      model: planning,
    })
  } catch (err) {
    console.error(err)
    return res
      .status(500)
      .json({ error: 'An error occurred while updating the planning.' })
  }
}

export const GetPlanningInfoForStudent = async (req, res) => {
  try {
    const Id = req.auth.userId
    const type = Number(req.params.type) // Type of internship (1 or 2), converted to number

    // Check if the internship type is valid (1 or 2)
    if (![1, 2].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid internship type. Must be 1 or 2.',
      })
    }

    const internship = await Internship.find({
      studentId: Id,
      level: type,
    })

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found for this student and level.',
      })
    }

    // Retrieve all internship plannings where the student is assigned
    const planningDetails = await Promise.all(
      internship.map(async (internship) => {
        const planning = await InternshipPlanning.findOne({
          idInternship: internship._id,
        })
          .populate({
            path: 'idInternship',
            populate: {
              path: 'studentId',
            },
          })
          .populate({
            path: 'EvaluatorId',
            select: 'firstName lastName email',
          })
          .populate('academicyear')

        const isOwner = planning.idInternship.studentId._id.toString() === Id
        if (!isOwner) {
          return res.status(403).json({
            success: false,
            message:
              'This internship does not belong to the connected student.',
          })
        }
        const EvaluatorFullName = `${planning.EvaluatorId.firstName || ''} ${planning.EvaluatorId.lastName || ''}`
        return {
          teacher: {
            EvaluatorFullName,
            email: planning.EvaluatorId.email,
          },
          meeting: {
            date: planning.meeting.date,
            time: planning.meeting.time,
            googleMeetLink: planning.meeting.googleMeetLink,
          },
          AcademicYear: `${new Date(planning.academicyear.start_year).getFullYear()}-${new Date(planning.academicyear.end_year).getFullYear()}`,
        }
      }),
    )

    // if no planning found
    const validPlannings = planningDetails.filter(
      (planning) => planning.success !== false,
    )

    if (validPlannings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid internship planning found.',
      })
    }
    // If internships are found, return the internships in the response
    return res.status(200).json({
      success: true,
      model: validPlannings,
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
    const teacherSubjectCounts = []
    let foundTeacher = false

    // Check if each teacher exists in the database
    for (const teacherId of teacherIds) {
      const teacher = await getTeacher(teacherId)

      if (!teacher) {
        console.warn(`Teacher with ID ${teacherId} not found.`)
        continue // If the teacher doesn't exist, skip to the next one
      }

      // If the teacher exists, count their subjects
      const subjectCount = teacher.subjects.length
      teacherSubjectCounts.push({
        teacherId: teacher._id,
        subjectCount: subjectCount,
      })

      // Mark that a valid teacher was found
      foundTeacher = true
    }

    // If no teacher was found
    if (!foundTeacher) {
      throw new Error('None of the specified teachers were found.')
    }

    return { success: true, data: teacherSubjectCounts }
  } catch (err) {
    return { success: false, message: 'NO teachers Found.', error: err.message }
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
