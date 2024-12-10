import Internship from '../../models/internship-models/internship_model.js'
import Document from '../../models/document-models/document_model.js'
import Period from '../../models/period-model/period_model.js'
import AcademicYear from '../../models/academic_year_models/academic-year-model.js'
import Student from '../../models/users-models/student_model.js'
// Add internship
export const addInternship = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      academicYear,
      studentId,
      periodeId,
      title,
      level, // Added level here
      description,
    } = req.body

    const { type } = req.params // Extract type from URL parameters
    console.log('Type from URL:', type)

    // Validate required fields
    if (
      !academicYear ||
      !studentId ||
      !periodeId ||
      !title ||
      !description ||
      !level
    ) {
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

    // Fetch the period to validate its name, level, and endDate
    const period = await Period.findById(periodeId)
    console.log('Fetched period:', period) // Debugging

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

    // Validate that the type matches the period's level
    if (parseInt(type) !== period.type) {
      return res.status(400).json({
        message: `The type in the URL (${type}) does not match the period's level (${period.type}).`,
      })
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
    const today = new Date()
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
      published: true, // default value
      Validate: { value: false, reason: '' }, // default values
      periodeId,
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

    res.status(200).json({
      message: 'Internship period and related documents successfully deleted!',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Error deleting internship period',
    })
  }
}

export const assignTeachersToInternship = async (req, res) => {
  try {
    const { teacherIds } = req.body; // List of teacher IDs from the request body
    const internshipType = req.params.type; // '1st_year' or '2nd_year'

    // Fetch internships by type (1st_year or 2nd_year)
    const internships = await Internship.find({ type: internshipType });

    // If no internships are found, return an error
    if (!internships || internships.length === 0) {
      return res.status(400).json({ message: `No internships found for the type '${internshipType}'` });
    }

    // Fetch teachers who have the provided teacherIds
    const teachers = await Teacher.find({ _id: { $in: teacherIds } });

    // If teachers are not found based on the provided IDs, return an error
    if (!teachers || teachers.length !== teacherIds.length) {
      return res.status(400).json({ message: "Some teachers were not found." });
    }

    // Assuming you have a list of teachers that you want to assign internships to
    const teacherSubjectCounts = {};

    // Loop through each teacher to populate their subjects and count them
    for (const teacher of teachers) {
      try {
        // Use the populate() method to retrieve all subjects assigned to the teacher
        const teacherWithSubjects = await Teacher.findById(teacher._id).populate('subjects'); // 'subjects' is the field in Teacher model referencing Subject

        // Count the number of subjects for each teacher
        teacherSubjectCounts[teacher._id] = teacherWithSubjects.subjects.length;
      } catch (error) {
        console.error(`Error populating subjects for teacher ${teacher._id}:`, error);
      }
    }

    // Sort teachers based on the number of subjects (higher number of subjects gets more internships)
    const sortedTeachers = teachers.sort((a, b) => teacherSubjectCounts[b._id] - teacherSubjectCounts[a._id]);

    // Assign internships to teachers proportionally based on the number of subjects
    let teacherIndex = 0;
    const assignments = [];

    for (let i = 0; i < internships.length; i++) {
      const internship = internships[i];
      const teacher = sortedTeachers[teacherIndex]; // Get the current teacher to assign

      // Create the internship planning entry
      const internshipPlanning = new InternshipPlanning({
        idInternship: internship._id,
        EvaluatorId: teacher._id,
        published: false, // Initially, the planning is not published
        evaluation: {
          status: 'En attente', // Default evaluation status
        },
        sendTo: {
          studentEmail: internship.studentId.email, // Assuming studentId has an email
          teacherEmail: teacher.email, // Assuming teacher has an email
        },
      });

      // Save the internship planning entry
      await internshipPlanning.save();
      assignments.push(internshipPlanning);

      // Move to the next teacher, looping back to the first teacher if necessary
      teacherIndex = (teacherIndex + 1) % sortedTeachers.length;
    }

    // Return success response
    return res.status(201).json({
      message: 'Teachers successfully assigned to internships.',
      assignments,
    });

  } catch (error) {
    console.error("Error assigning teachers to internships:", error);
    return res.status(500).json({
      message: "Error assigning teachers to internships.",
      error: error.message,
    });
  }
};

export const updateInternshipPlanning = async (req, res) => {
  try {
    const { idInternship, idTeacher } = req.body;  // ID du stage et de l'enseignant
    const type = req.params.type;  // Type de stage (par exemple '1st_year' ou '2nd_year')
    
    // Vérification si le stage existe
    const internship = await Internship.findById(idInternship);
    if (!internship) {
      return res.status(404).json({ message: 'Stage not found.' });
    }

    // Vérification que le type de stage correspond au type attendu
    if (internship.type !== type) {
      return res.status(400).json({ message: `Stage type mismatch. Expected ${type}, but found ${internship.type}.` });
    }

    // Vérification si l'enseignant existe
    const teacher = await Teacher.findById(idTeacher);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    // Recherche de l'affectation existante dans le planning pour ce stage
    const internshipPlanning = await InternshipPlanning.findOne({ idInternship });
    if (!internshipPlanning) {
      return res.status(404).json({ message: 'Internship planning not found.' });
    }

    // Mise à jour de l'enseignant affecté à ce stage
    internshipPlanning.EvaluatorId = idTeacher;  // Mise à jour de l'ID de l'enseignant
    internshipPlanning.sendTo.teacherEmail = teacher.email;  // Mise à jour de l'email de l'enseignant

    // Sauvegarde de l'affectation mise à jour
    await internshipPlanning.save();

    return res.status(200).json({
      message: 'Teacher updated successfully for the internship.',
      internshipPlanning,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating teacher for internship.' });
  }
};
// contient des doutes --> revoir  entre dans chaque planning et voir le type pour modifié la status à published ou unpublished
export const publishOrMaskPlanning = async (req, res) => {
  try {
    const { type } = req.params; // '1st_year' or '2nd_year'
    const { response } = req.params; // 'true' or 'false' to publish or mask the planning
    const { idInternship } = req.body; // The internship ID to update
    
    // Validate that response is either 'true' or 'false'
    if (response !== 'true' && response !== 'false') {
      return res.status(400).json({ message: 'Invalid response value. It should be either "true" or "false".' });
    }

    // Convert response to a boolean
    const isPublished = response === 'true';

    // Find the internship planning for the specified type (1st_year or 2nd_year)
    const internships = await Internship.find({ type });

    // If no internships are found for the specified type, return an error
    if (!internships || internships.length === 0) {
      return res.status(404).json({ message: `No internships found for the type: ${type}` });
    }

    // Iterate over each internship and update its 'published' field
    for (const internship of internships) {
      const internshipPlanning = await InternshipPlanning.findOne({ idInternship: internship._id });

      // If the internship planning doesn't exist, continue to the next
      if (!internshipPlanning) {
        continue;
      }

      // Update the 'published' field based on the response
      internshipPlanning.published = isPublished;

      // Save the updated internship planning
      await internshipPlanning.save();
    }

    // Return success response
    return res.status(200).json({
      message: isPublished ? `Internships for '${type}' published successfully.` : `Internships for '${type}' hidden successfully.`,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error publishing or masking internship planning.' });
  }
};
//on peut masquer par type et id du stage aussi --> autre controller publishOrMaskPlanningById

export const sendInternshipPlanningEmail = async (req, res) => {
  const { type } = req.params;  // Extract the type from the URL parameters

  // Generate the link to the planning (replace with actual link generation logic)
  const planningLink = `http://example.com/planning/${type}`; // Example link, modify based on your needs

  try {
    // Find internships matching the type
    const internships = await Internship.find({ 'type': type });

    // If no internships are found
    if (!internships.length) {
      return res.status(404).json({ error: 'No internship found for this type.' });
    }

    // Configure the email transporter with Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Sender's email address
        pass: process.env.EMAIL_PASSWORD, // Sender's email password
      },
    });

    // Loop through internships to send an email to each student/teacher
    for (const internship of internships) {
      let subject = '';
      let text = '';

      // Check if it's the first or second email based on the flag
      if (internship.SentMail === false) {
        // First email
        subject = 'First sending of the internship planning';
        text = `Hello,\n\nHere is the link to the internship planning: ${planningLink}\n\nBest regards.`;
        internship.SentMail = true; // Set the flag to true after the first send
      } else {
        // Second email
        subject = 'Second sending of the internship planning';
        text = `Hello,\n\nThis is a reminder with the link to the internship planning: ${planningLink}\n\nBest regards.`;
      }

      // Email configuration
      const mailOptions = {
        from: process.env.EMAIL_USER, // Sender's email address
        to: 'recipient@example.com', // Replace with the student's or teacher's email
        subject: subject,
        text: text,
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      // Update the internship with  sending date
      internship.sentAt = new Date();  // Date of sending
      await internship.save();
    }

    // Response to the request
    return res.status(200).json({ message: 'Emails have been sent successfully.' });
  } catch (error) {
    console.error('Error sending emails:', error.message);
    return res.status(500).json({ error: 'An error occurred while sending the emails.' });
  }
};