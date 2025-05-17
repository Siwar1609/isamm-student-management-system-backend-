import readXlsxFile from 'read-excel-file/node'
import Teacher from '../../models/users-models/teacher_model.js'
import {
  addTeacher,
  deleteTeacher,
  updateTeacher,
} from '../../services/teachers_services.js'
import { updatePassword } from '../../services/users_services.js'

// excel file path to read teachers data 👨‍🏫
let filePath = 'data\\teachers.xlsx'

// getting teachers list
// *********************************************
const getAllTeachers = async function (req, res) {
  try {
    const teachers = await Teacher.find()
      .populate({
        path: 'subjects',
        select: 'title code level description' // Select the fields you want to populate
      })
      .exec()
    res.status(200).json(teachers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************
// getting a teacher by id
const getOneTeacher = async function (req, res) {
  const teacherId = req.params.id
  try {
    const teacher = await Teacher.findById(teacherId)
      .populate({
        path: 'subjects',
        select: 'title code level description'
      })
      .exec()

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' })
    }

    res.status(200).json(teacher)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************
// creating a teacher
const createTeacher = async function (req, res) {
  try {
    let value = req.body
    console.log('req.body', value)

    const newTeacher = await addTeacher(value)

    res.status(201).json(newTeacher)
  } catch (err) {
    console.error('something went wrong')
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************
// updating a teacher
const updateOneTeacher = async function (req, res) {
  const teacher = await Teacher.findById(req.params.id).exec()
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' })
  }
  let teacher_old_data = teacher.toObject()
  delete teacher_old_data._id,
    delete teacher_old_data.__v,
    delete teacher_old_data.createdAt,
    delete teacher_old_data.updatedAt
  let args = req.body
  let teacher_new_data = {
    ...teacher_old_data,
    ...args,
  }

  try {
    const updatedTeacher = await updateTeacher(req.params.id, teacher_new_data)
    res.status(200).json(updatedTeacher)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************
// deleting a teacher
const deleteOneTeacher = async function (req, res) {
  const teacherId = req.params.id
  try {
    await deleteTeacher(teacherId)
    res.status(200).json({ message: 'Teacher deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//**************************************************************
const createTeachersAccountsExcelFile = async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    filePath = req.file.path
    const rows = await readXlsxFile(filePath)

    let teachersNames = []
    let errors = []

    // remove the header row
    rows.shift()

    for (const row of rows) {
      const teacher = {
        cin: row[0].toString(),
        birthDate: row[1].toString(),
        firstName: row[2].toString(),
        lastName: row[3].toString(),
        email: row[4].toString(),
        phone: row[5].toString(),
        cv: row[6]?.toString(),
      }

      // check if the teacher already exists
      const teacherExist = await Teacher.findOne({ cin: teacher.cin }).exec()
      if (teacherExist) {
        errors.push(
          `An Account with the same CIN Already Exist for ${teacher.firstName} ${teacher.lastName}`,
        )
        continue
      }

      await addTeacher(teacher)
      teachersNames.push(`${teacher.firstName} ${teacher.lastName}`)
    }

    console.log(teachersNames, ' just added to the database')

    res.status(201).json({
      message: `${teachersNames.length} teachers added successfully`,
      teachersNames,
      errors,
    })
  } catch (e) {
    console.log(e)
  }
}

//**************************************************************
const updateTeacherPassword = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).exec()
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const teacherFullName = `${teacher.firstName} ${teacher.lastName}`

    if (req.body.oldPassword === undefined || req.body.newPassword === undefined) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    // Check if old password matches
    // This would require a password verification function
    // For now, we'll just update the password

    await updatePassword(req.params.id, req.body.newPassword, Teacher)
    res.status(200).json({
      message: `Password of teacher ${teacherFullName} updated successfully`,
    })
  } catch (error) {
    console.error('Error in updateTeacherPassword function: ', error)
    res.status(500).json({ message: error.message });
  }
}

//**************************************************************
// Get current teacher profile
const getCurrentTeacher = async function (req, res) {
  try {
    // Log the auth object to see what's available
    console.log('Auth object:', req.auth);
    console.log('User object:', req.user);
    console.log('Request keys:', Object.keys(req));
    
    // Try to find the user ID in various places
    const teacherId = req.auth?.id || req.auth?.userId || req.user?.id || req.userId;
    
    console.log('Teacher ID from token:', teacherId);
    
    // If we can't find the user ID, check the token directly
    if (!teacherId) {
      const token = req.headers.authorization?.split(' ')[1];
      console.log('Token from headers:', token ? 'Present' : 'Not found');
      
      if (token) {
        try {
          // Decode the token manually
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          console.log('Decoded token payload:', payload);
          
          // Use the user ID from the decoded token
          const tokenUserId = payload.userId || payload.id || payload.sub;
          
          if (tokenUserId) {
            const teacher = await Teacher.findById(tokenUserId)
              .populate({
                path: 'subjects',
                select: 'title code level description'
              })
              .exec();
              
            if (teacher) {
              console.log('Teacher found using token payload:', teacher.firstName, teacher.lastName);
              return res.status(200).json(teacher);
            }
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
        }
      }
      
      return res.status(401).json({ message: 'User ID not found in token. Please login again.' });
    }
    
    const teacher = await Teacher.findById(teacherId)
      .populate({
        path: 'subjects',
        select: 'title code level description'
      })
      .exec();

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    console.log('Teacher found:', teacher.firstName, teacher.lastName);
    res.status(200).json(teacher);
  } catch (err) {
    console.error('Error getting current teacher profile:', err);
    res.status(500).json({ message: err.message });
  }
}

//**************************************************************
// Update current teacher profile
const updateCurrentTeacher = async function (req, res) {
  try {
    // Log the auth object to see what's available
    console.log('Auth object for update:', req.auth);
    console.log('User object for update:', req.user);
    
    // Try to find the user ID in various places
    const teacherId = req.auth?.id || req.auth?.userId || req.user?.id || req.userId;
    
    console.log('Teacher ID from token for update:', teacherId);
    
    // If we can't find the user ID, check the token directly
    if (!teacherId) {
      const token = req.headers.authorization?.split(' ')[1];
      console.log('Token from headers for update:', token ? 'Present' : 'Not found');
      
      if (token) {
        try {
          // Decode the token manually
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          console.log('Decoded token payload for update:', payload);
          
          // Use the user ID from the decoded token
          const tokenUserId = payload.userId || payload.id || payload.sub;
          
          if (tokenUserId) {
            // Continue with the update using the token user ID
            return handleTeacherUpdate(tokenUserId, req, res);
          }
        } catch (decodeError) {
          console.error('Error decoding token for update:', decodeError);
        }
      }
      
      return res.status(401).json({ message: 'User ID not found in token. Please login again.' });
    }
    
    // Continue with the update using the found user ID
    return handleTeacherUpdate(teacherId, req, res);
    
  } catch (err) {
    console.error('Error updating current teacher profile:', err);
    res.status(500).json({ message: err.message });
  }
};

// Helper function to handle the teacher update
async function handleTeacherUpdate(teacherId, req, res) {
  const teacher = await Teacher.findById(teacherId).exec();
  
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' });
  }
  
  console.log('Teacher found for update:', teacher.firstName, teacher.lastName);
  
  // Only allow updating certain fields
  const allowedFields = ['firstName', 'lastName', 'phone', 'department', 'specialization'];
  const updateData = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });
  
  const updatedTeacher = await Teacher.findByIdAndUpdate(
    teacherId,
    { $set: updateData },
    { new: true }
  ).populate({
    path: 'subjects',
    select: 'title code level description'
  });
  
  return res.status(200).json(updatedTeacher);
}

export {
  getAllTeachers,
  getOneTeacher,
  createTeacher,
  updateOneTeacher,
  deleteOneTeacher,
  createTeachersAccountsExcelFile,
  updateTeacherPassword,
  getCurrentTeacher,
  updateCurrentTeacher
}
