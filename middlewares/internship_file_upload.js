import multer from 'multer'
import path from 'path'
import Student from '../models/users-models/student_model.js'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/') // Save files in the 'uploads' directory
  },
  filename: async (req, file, cb) => {
    try {
      // Extract the student ID from req.auth.userId
      const studentId = req.auth.userId

      // Fetch student details from the database
      const student = await Student.findById(studentId)

      if (student && student.firstName && student.lastName) {
        const ext = path.extname(file.originalname) // Get the file extension
        cb(null, `${student.firstName} ${student.lastName}${ext}`) // Save the file as 'FirstName LastName.extension'
      } else {
        cb(
          new Error('Student firstName or lastName not found in the database.'),
        )
      }
    } catch (error) {
      cb(new Error('Error fetching student details for file naming.'))
    }
  },
})

const upload1 = multer({ storage: storage }).array('documents', 10) // Limit to 10 files

export default upload1
