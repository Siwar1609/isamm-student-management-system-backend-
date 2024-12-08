import Internship from '../../models/internship-models/internship_model.js'
import Document from '../../models/document-models/document_model.js'
import Teacher from '../../models/users-models/teacher_model.js'
import Period from '../../models/period-model/period_model.js';
import InternshipPlanning from '../../models/planning-models/Internship_planning.js';


// import Teacher from '../users-models'


/*export const addInternship = async (req, res) => {
  try {
    const { startDate, endDate, title, level,Description } = req.body

    // Validate that the level is provided
    if (!level || ![1, 2].includes(level)) {
      return res.status(400).json({
        message: 'Level is required and must be either 1 or 2.',
      });
    }

    // Validate that the start date is before the end date
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message:
          'Invalid date range. The end date must be after the start date.',
      })
    }

    // Check if an internship with the same date range already exists
    const existingInternship = await Internship.findOne({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    })

    if (existingInternship) {
      return res.status(400).json({
        message: 'An internship with the same date range already exists.',
      })
    }

    // Determine the status
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
      title,
      level, // Add the level here
      Description,
    })

    res.status(201).json({
      model: newInternship,
      message: 'Internship period successfully added!',
    })
  } catch (error) {
    console.error('Error during addInternship:', error)
    res.status(400).json({
      error: error.message,
      message: 'Error adding internship period',
    })
  }
}*/

/*export const updateInternship = async (req, res) => {
  try {
    const internshipId = req.params.id
    const { startDate, endDate, level, ...otherUpdates } = req.body

    // Find the internship by ID
    const existingInternship = await Internship.findById(internshipId)
    if (!existingInternship) {
      return res.status(404).json({ message: 'Internship not found' })
    }

    // Validate the level field if it's provided
    if (level && !['1st year', '2nd year'].includes(level)) {
      return res.status(400).json({
        message: 'Level must be either "1st year" or "2nd year".',
      })
    }

    // Validate start and end dates
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message:
          'Invalid date range. The end date must be after the start date.',
      })
    }

    // Check if an internship with the same date range already exists (excluding the current one)
    if (startDate && endDate) {
      const duplicateInternship = await Internship.findOne({
        _id: { $ne: internshipId }, // Exclude the current internship
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      })

      if (duplicateInternship) {
        return res.status(400).json({
          message: 'An internship with the same date range already exists.',
        })
      }
    }

    // Update fields
    if (startDate) existingInternship.startDate = new Date(startDate)
    if (endDate) existingInternship.endDate = new Date(endDate)
    if (level) existingInternship.level = level

    Object.assign(existingInternship, otherUpdates)

    // Update the status based on the updated dates
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
    res.status(400).json({
      error: error.message,
      message: 'Error updating internship',
    })
  }
}*/

/*export const getAllInternships = async (req, res) => {
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
}*/

/*export const getInternshipById = async (req, res) => {
  try {
    const internshipId = req.params.id

    const singleInternship = await Internship.findById(internshipId)
    if (!singleInternship) {
      return res.status(404).json({ message: 'Internship period not found' })
    }

    res.status(200).json({
      model: singleInternship,
      message: 'Internship period retrieved successfully!',
    })
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: 'Error retrieving internship period',
    })
  }
}*/

/*export const deleteInternship = async (req, res) => {
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
}*/

export const createPeriod = async (req, res) => {
  try {
    const type = req.params.type;  // Récupérer le type de la période à partir de l'URL
    const { start_date, end_date } = req.body;

    console.log("Données reçues : ", { start_date, end_date, type });

    // Vérification que les dates sont valides et autres contrôles
    if (new Date(start_date) > new Date(end_date)) {
      console.log("Erreur : La date de début est après la date de fin");
      return res.status(400).json({ message: 'La date de début ne peut pas être après la date de fin.' });
    }

    // Vérification que la période n'est pas déjà ouverte
    const existingPeriod = await Period.findOne({ name: 'Dépôt de stage', type });
    if (existingPeriod) {
      console.log("Période déjà ouverte pour ce type :", existingPeriod);
      return res.status(400).json({ message: `La période 'Dépôt de stage' pour ${type} est déjà ouverte.` });
    }

    // Créer la période de stage avec les données spécifiées
    const newPeriod = new Period({
      name: 'Dépôt de stage',
      type,
      start_date,
      end_date,
    });

    await newPeriod.save();

    console.log("Période créée avec succès :", newPeriod);

    return res.status(201).json({
      message: 'Période de stage créée avec succès.',
      model: newPeriod,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la période : ", error);
    return res.status(500).json({ message: 'Erreur lors de la création de la période.', error: error.message });
  }
};

// Fonction pour obtenir les informations de délai
export const getPeriodInfo = async (req, res) => {
  try {
    const type = req.params.type; // Récupère le type à partir des paramètres d'URL

    // Recherche de la période ouverte pour le type donné
    const period = await Period.findOne({
      name: 'Dépôt de stage',
      type,
    });

    // Si aucune période trouvée, retournez une erreur
    if (!period) {
      return res.status(404).json({ message: `Aucun délai n'est ouvert pour le type '${type}'.` });
    }

    // Retournez les informations de la période
    return res.status(200).json({
      message: 'Informations sur la période récupérées avec succès.',
      period,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de la période :', error);
    return res.status(500).json({
      message: 'Erreur lors de la récupération des informations de la période.',
      error: error.message,
    });
  }
};

// Fonction pour modifier les délais
export const updatePeriodDates = async (req, res) => {
  try {
    const type = req.params.type; // Récupère le type depuis l'URL
    const { start_date, end_date } = req.body;

    // Validation des dates
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: 'La date de début ne peut pas être après la date de fin.' });
    }

    // Recherche de la période
    const period = await Period.findOne({
      name: 'Dépôt de stage',
      type,
    });

    // Vérification si la période existe
    if (!period) {
      return res.status(404).json({ message: `La période 'Dépôt de stage' pour '${type}' n'est pas ouverte.` });
    }

    // Mise à jour des dates
    period.start_date = start_date;
    period.end_date = end_date;

    // Enregistrement de la mise à jour
    await period.save();

    return res.status(200).json({
      message: 'Les délais de la période ont été modifiés avec succès.',
      period,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des délais de la période :', error);
    return res.status(500).json({
      message: 'Erreur lors de la mise à jour des délais de la période.',
      error: error.message,
    });
  }
};

export const createInternship = async (req, res) => {
  try {
    const { title, description, startDate, endDate, documents,studentId } = req.body;
    const type = req.params.type;  // '1st_year' or '2nd_year'

    // Check if the period for the specified type is open
    const period = await Period.findOne({ name: 'Dépôt de stage', type });

    // If no period exists for the given type, return an error message
    if (!period) {
      return res.status(400).json({ message: `No open period for '${type}'` });
    }

    // If the period exists, check if it is currently open (within the start and end date range)
    const currentDate = new Date();
    if (period.start_date > currentDate || period.end_date < currentDate) {
      return res.status(400).json({ message: `The period for '${type}' is not currently open.` });
    }

    // Validate that the internship type matches the open period type
    if ((type === '1st_year' && period.name !== 'Dépôt de stage') || 
        (type === '2nd_year' && period.name !== 'Dépôt de stage')) {
      return res.status(400).json({ message: `The internship type does not match the open period.` });
    }

    // Create the internship entry
    const newInternship = new Internship({
      title,
      description,
      startDate,
      endDate,
      type: type ,  // First or second year based on the type
      studentId,  // Assuming studentId is available
      documents,
      periodId: period._id,  // Link the internship to the open period
    });

    // Save the internship
    await newInternship.save();

    // Return success response
    return res.status(201).json({
      message: 'Internship created successfully.',
      internship: newInternship,
    });

  } catch (error) {
    // Log detailed error for debugging
    console.error('Error creating internship:', error.message);
    console.error('Stack trace:', error.stack);

    // Return a detailed error message in the response
    return res.status(500).json({
      message: 'Error creating internship.',
      error: error.message,
    });
  }
};

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



