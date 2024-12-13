import Chapter from '../../models/subject-models/chapter_model.js'
import chapterValidator from '../../validators/chapter_validator.js'
import Subject from '../../models/subject-models/subject_model.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import Student from '../../models/users-models/student_model.js'

dotenv.config()

const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASSWORD

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
    const { section, ...updates } = req.body // Expecting section as an array
    console.log('Incoming payload:', req.body)

    // Find the chapter
    const chapter = await Chapter.findById(chapterId)
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' })
    }
    console.log('Current chapter sections:', chapter.section)

    let emailNeeded = false

    // Check if section update is present
    if (section && section[0]) {
      const sectionIndex = chapter.section.findIndex(
        (sec) => sec.content === section[0].content,
      )
      console.log('Section index:', sectionIndex)

      if (sectionIndex === -1) {
        return res
          .status(400)
          .json({ message: 'Section content not found in chapter' })
      }

      const sectionToUpdate = chapter.section[sectionIndex]

      // Check for advancement update
      if (
        section[0].advancement &&
        section[0].advancement !== sectionToUpdate.advancement
      ) {
        emailNeeded = true
        console.log('Advancement will be updated. Email will be triggered.')
        sectionToUpdate.advancement = section[0].advancement // Update advancement
      }
    }

    // Apply other updates to the chapter
    Object.keys(updates).forEach((key) => {
      if (chapter[key] !== undefined) {
        chapter[key] = updates[key]
      }
    })

    // Save the updated chapter
    await chapter.save()
    console.log('Chapter updated successfully:', chapter)

    // Send email if needed
    if (emailNeeded) {
      console.log('Preparing to send email...')

      const subject = await Subject.findById(chapter.subjectId).populate(
        'studentId',
      )
      if (!subject || !subject.studentId || subject.studentId.length === 0) {
        return res.status(404).json({ message: 'Related student not found' })
      }

      const student = await Student.findById(subject.studentId[0])
      console.log('Found student:', student)

      if (!student || !student.email) {
        return res.status(404).json({ message: 'Student email not found' })
      }

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      })

      try {
        await transporter.verify()
        console.log('Email transport verified successfully.')
      } catch (err) {
        console.error('Email transport verification failed:', err.message)
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: 'Chapter Section Progress Update',
        text: ` Dear ${student.firstName} ${student.lastName},\n\nThe progress of the section titled "${section[0].content}" in the chapter "${chapter.title}" has been updated to "${section[0].advancement}".\n\n
        Best regards,\n\n
        `,
      }

      try {
        await transporter.sendMail(mailOptions)
        console.log('Email sent successfully to:', student.email)
      } catch (err) {
        console.error('Error sending email:', err.message)
      }
    }

    res.status(200).json({
      model: chapter,
      message: 'Chapter updated successfully!',
    })
  } catch (error) {
    console.error('Error during updateProgressChapter:', error)
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
