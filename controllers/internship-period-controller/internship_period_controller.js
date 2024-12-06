import Internship from '../../models/internship-models/internship_period_model.js'
import Document from '../../models/document-models/document_model.js'
import Teacher from '../../models/users-models/teacher_model.js'


// import Teacher from '../users-models'

export const addInternship = async (req, res) => {
  try {
    const { startDate, endDate, name, level } = req.body

    // Validate that the level is provided
    if (!level || !['1st year', '2nd year'].includes(level)) {
      return res.status(400).json({
        message:
          'Level is required and must be either "1st year" or "2nd year".',
      })
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
      status,
      level, // Add the level here
      name,
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
}

export const updateInternship = async (req, res) => {
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

export const assignTeacherToInternship = async (req, res) => {
  try {
    const { type } = req.params; // Retrieve level of the internship(1 ou 2)
    const { teacherIds } = req.body; // List of IDs teachers

    // first step 1 : found internships not  already assigned for a level
    const internships = await Internship.find({
      level: parseInt(type, 10),
      teacherId: null,
    });

    if (internships.length === 0) {
      return res.status(404).json({ message: "there is no internship in this level" });
    }

    // step 2 : Retrieve teachers by their IDs
    const teachers = await Teacher.find({ _id: { $in: teacherIds } });

    if (teachers.length === 0) {
      return res.status(404).json({ message: "No teacher found with these IDs" });
    }

    // Step 3: Calculate the proportion based on the number of subjects taught
    const totalSubjects = teachers.reduce((acc, teacher) => acc + teacher.subjects.length, 0);
    const assignments = {};
    // Iterate through the teachers to calculate their maximum assignments
    teachers.forEach(teacher => {
      const maxAssignments = Math.round((teacher.subjects.length / totalSubjects) * internships.length);
      assignments[teacher._id] = { maxAssignments, assigned: 0 };
    });

    // Step 4: Assign internships to teachers
    for (const internship of internships) {
      const availableTeacher = teachers.find(teacher =>
        assignments[teacher._id].assigned < assignments[teacher._id].maxAssignments
      );

      if (availableTeacher) {
        internship.teacherId = availableTeacher._id; // Assign the teacher
        await internship.save(); // Save the updated internship in the database--> only the field teacher_id change

        assignments[availableTeacher._id].assigned += 1;// number of assigned internship
      }
    }

    // Success response
    res.status(200).json({
      message: "Internships successfully assigned..",
      details: assignments,
    });
  } catch (error) {
    console.error("Error assigning internships:", error);
    res.status(500).json({ error: "An error occurred." });
  }
};

export const updateTeacherForInternship = async (req, res) => {
  try {
    const { type } = req.params; // Retrieve the internship level (1 or 2)
    const { internshipId, teacherId } = req.body; // Get the internship ID and teacher ID from the request body

    // Step 1: Find the internship by its ID and check the level
    const internship = await Internship.findOne({ 
      _id: internshipId, 
      level: parseInt(type, 10) 
    });

    if (!internship) {
      return res.status(404).json({ message: "Internship not found or does not match the specified level." });
    }

    // Step 2: Check if the teacher exists
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Step 3: Assign the teacher to the internship
    internship.teacherId = teacher._id;

    // Step 4: Save the updated internship
    await internship.save(); // Save the changes to the internship document

    // Step 5: Update the teacher's internships list (optional)
    teacher.internships.push(internship._id); // Add the internship to the teacher's list
    await teacher.save(); // Save the teacher's updated record

    // Success response
    res.status(200).json({
      message: "Teacher successfully assigned to the internship.",
      internship: internship,
    });
  } catch (error) {
    console.error("Error assigning teacher to internship:", error);
    res.status(500).json({ error: "An error occurred." });
  }
};

export const publishOrUnpublishInternshipPlanning = async (req, res) => {
  try {
    const { type, response } = req.params; // Extract internship level and publish action

    // Step 1: Validate the response parameter ('publish' or 'unpublish')
    const publishStatus = response === "publish" ? true : response === "unpublish" ? false : null;

    if (publishStatus === null) {
      return res.status(400).json({ message: "Invalid response. Use 'publish' or 'unpublish'." });
    }

    // Step 2: Find and update internships of the specified level
    const result = await Internship.updateMany(
      { level: parseInt(type, 10) }, // Filter by internship level
      { $set: { published: publishStatus } } // Update the `published` field
    );

    // Step 3: Check if any documents were updated
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "No internships found for the specified level." });
    }

    // Step 4: Respond with a success message
    res.status(200).json({
      message: `Internship planning successfully ${response === "publish" ? "published" : "unpublished"}.`,
      details: {
        updatedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error publishing/unpublishing internship planning:", error);
    res.status(500).json({ error: "An error occurred." });
  }
};




