import Chapter from '../../models/subject-models/chapter_model.js'
import chapterValidator from '../../validators/chapter_validator.js'
import Subject from '../../models/subject-models/subject_model.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import Student from '../../models/users-models/student_model.js'

dotenv.config()
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

export const fetchChapter = async (req, res) => {
  try {
    const chapters = await Chapter.find()
    res
      .status(200)
      .json({ model: chapters, message: 'Chapters fetched successfully' })
  } catch (e) {
    res
      .status(400)
      .json({ error: e.message, message: 'Failed to fetch chapters' })
  }
}

export const getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findOne({ _id: req.params.id })
    if (!chapter) {
      res.status(404).json({ message: 'Chapter not found' })
    } else {
      res.status(200).json({ model: chapter, message: 'Chapter found' })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const addChapter = async (req, res) => {
  try {
    // Validate the input data
    const { error } = chapterValidator.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
        message: 'Invalid data',
      })
    }

    const { subjectId } = req.body

    // Check if the subjectId exists in the database
    const subjectExists = await Subject.findById(subjectId)
    if (!subjectExists) {
      return res.status(400).json({
        error: 'Invalid subjectId',
        message: 'The specified subject does not exist.',
      })
    }

    // Create and save the new chapter
    const chapter = new Chapter(req.body)
    await chapter.save()

    // Now push the chapter's ID to the subject's chapId array
    subjectExists.chapId.push(chapter._id)
    await subjectExists.save()

    res.status(201).json({
      model: chapter,
      message: 'Chapter added successfully',
    })
  } catch (error) {
    console.error('Error:', error.message)
    res.status(400).json({
      error: error.message,
      message: 'Failed to add chapter',
    })
  }
}

export const updateProgressChapter = async (req, res) => {
  try {
    const chapterId = req.params.id
    const { sectionIndex, newSection, ...updates } = req.body

    // Find the chapter
    const chapter = await Chapter.findById(chapterId)
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' })
    }

    let emailNeeded = false

    if (newSection) {
      // Add a new section
      chapter.section.push(newSection)
    } else if (sectionIndex !== undefined) {
      // Validate section index
      if (sectionIndex < 0 || sectionIndex >= chapter.section.length) {
        return res.status(400).json({ message: 'Invalid section index' })
      }

      const sectionToUpdate = chapter.section[sectionIndex]

      // Check if advancement is being updated
      if (
        updates.advancement &&
        updates.advancement !== sectionToUpdate.advancement
      ) {
        emailNeeded = true
      }

      // Update section fields dynamically
      Object.keys(updates).forEach((key) => {
        if (sectionToUpdate[key] !== undefined) {
          sectionToUpdate[key] = updates[key]
        }
      })
    } else {
      // Update chapter fields dynamically
      Object.keys(updates).forEach((key) => {
        if (chapter[key] !== undefined) {
          chapter[key] = updates[key]
        }
      })
    }

    // Save the updated chapter
    await chapter.save()

    // Send email if the advancement was updated
    if (emailNeeded) {
      const subject = await Subject.findById(chapter.subjectId).populate(
        'studentId',
      )
      if (!subject || !subject.studentId || subject.studentId.length === 0) {
        return res.status(404).json({ message: 'Related student not found' })
      }

      const student = await Student.findById(subject.studentId[0])
      if (!student || !student.email) {
        return res.status(404).json({ message: 'Student email not found' })
      }

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      })

      const mailOptions = {
        from: 'your-email@gmail.com',
        to: student.email,
        subject: 'Chapter Section Progress Update',
        text: `Dear ${student.firstName} ${student.lastName},\n\nThe progress of the section titled "${chapter.section[sectionIndex].content}" in the chapter "${chapter.title}" has been updated to "${updates.advancement}".\n\nBest regards,\nYour Team`,
      }

      await transporter.sendMail(mailOptions)
      console.log('Email sent successfully to:', student.email)
    }

    res.status(200).json({
      model: chapter,
      message: 'Chapter updated successfully!',
    })
  } catch (error) {
    console.error('Error during updateChapter:', error)
    res
      .status(400)
      .json({ error: error.message, message: 'Failed to update chapter' })
  }
}

export const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id)
    if (!chapter) {
      res.status(404).json({ message: 'Chapter not found' })
    } else {
      res
        .status(200)
        .json({ model: chapter, message: 'Chapter deleted successfully' })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
