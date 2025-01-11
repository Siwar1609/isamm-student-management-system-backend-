import Chapter from '../../models/subject-models/chapter_model.js'
import chapterValidator from '../../validators/chapter_validator.js'
import Subject from '../../models/subject-models/subject_model.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import Student from '../../models/users-models/student_model.js'

dotenv.config()

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
    const chapterId = req.params.id // Get the Chapter ID from the URL
    const { sectionIndex, advancement, content, ...updates } = req.body // Destructure input fields

    console.log('Incoming payload:', req.body)

    // Find the chapter by ID
    const chapter = await Chapter.findById(chapterId)
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' })
    }
    console.log('Current chapter sections:', chapter.section)

    console.log('Current chapter sections:', chapter.section)

    let emailNeeded = false
    let chapterCompletedEmailNeeded = false

    // Update the specific section using sectionIndex
    if (sectionIndex !== undefined) {
      if (sectionIndex < 0 || sectionIndex >= chapter.section.length) {
        return res.status(400).json({ message: 'Invalid section index' })
      }

      const sectionToUpdate = chapter.section[sectionIndex]

      // Update the section's advancement if provided
      if (advancement && advancement !== sectionToUpdate.advancement) {
        emailNeeded = true // Email will be triggered for advancement update
        sectionToUpdate.advancement = advancement
        sectionToUpdate.modificationDate = new Date() // Set modification date
      }

      // Update the section's content if provided
      if (content) {
        sectionToUpdate.content = content
        sectionToUpdate.modificationDate = new Date() // Update modification date for content change
      }
    }

    // Apply any other updates to the chapter (e.g., title, order)
    Object.keys(updates).forEach((key) => {
      if (chapter[key] !== undefined) {
        chapter[key] = updates[key]
      }
    })

    // Check if all sections are now completed
    const allSectionsCompleted = chapter.section.every(
      (section) => section.advancement === 'completed',
    )

    if (allSectionsCompleted && !chapter.completed) {
      chapter.completed = true // Mark chapter as completed
      chapter.completedDate = new Date() // Set the completed date
      chapterCompletedEmailNeeded = true // Email will be triggered for chapter completion
    } else if (!allSectionsCompleted && chapter.completed) {
      chapter.completed = false // Unmark chapter as completed if not all sections are completed
      chapter.completedDate = undefined // Reset the completed date
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

    console.log('Chapter updated successfully:', chapter)

    // Send email if the advancement was updated
    if (emailNeeded) {
      console.log('Preparing to send email for section advancement update...')

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
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: 'Chapter Section Progress Update',
        text: `Dear ${student.firstName} ${student.lastName},\n\nThe progress of the section titled "${chapter.section[sectionIndex].content}" in the chapter "${chapter.title}" has been updated to "${advancement}" on ${chapter.section[sectionIndex].modificationDate}.\n\nBest regards,\nYour Team`,
      }

      try {
        await transporter.sendMail(mailOptions)
        console.log('Email sent successfully to:', student.email)
      } catch (err) {
        console.error('Error sending email:', err.message)
      }
    }

    // Send email if the chapter is fully completed
    if (chapterCompletedEmailNeeded) {
      console.log('Preparing to send email for chapter completion...')

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
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: 'Chapter Completed',
        text: `Dear ${student.firstName} ${student.lastName},\n\nCongratulations! The chapter "${chapter.title}" has been fully completed on ${chapter.completedDate}.\n\nBest regards,\nYour Team`,
      }

      try {
        await transporter.sendMail(mailOptions)
        console.log('Completion email sent successfully to:', student.email)
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
