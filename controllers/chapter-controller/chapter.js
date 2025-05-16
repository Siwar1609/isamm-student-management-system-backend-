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


export const updateProgressChapter = async (req, res) => {
  try {
    const chapterId = req.params.id;
    const { status, sections, ...updates } = req.body;

    console.log('Incoming payload:', req.body);

    // Find the chapter by ID
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    let emailNeeded = false;
    let chapterCompletedEmailNeeded = false;

    // Update chapter status if provided
    if (status && status !== chapter.status) {
      chapter.status = status;
      chapter.statusUpdatedAt = new Date();
      emailNeeded = true;
    }

    // Update sections if provided
    if (sections && Array.isArray(sections)) {
      sections.forEach((updatedSection, index) => {
        if (index < chapter.section.length) {
          const sectionToUpdate = chapter.section[index];
          
          // Update section advancement if changed
          if (updatedSection.advancement && 
              updatedSection.advancement !== sectionToUpdate.advancement) {
            sectionToUpdate.advancement = updatedSection.advancement;
            sectionToUpdate.statusUpdatedAt = new Date();
            emailNeeded = true;
          }

          // Update content if provided
          if (updatedSection.content) {
            sectionToUpdate.content = updatedSection.content;
          }
        }
      });
    }

    // Check if all sections are now completed
    const allSectionsCompleted = chapter.section.every(
      (section) => section.advancement === 'completed'
    );

    // Update chapter completion status if needed
    if (allSectionsCompleted && chapter.status !== 'completed') {
      chapter.status = 'completed';
      chapter.statusUpdatedAt = new Date();
      chapterCompletedEmailNeeded = true;
    } else if (!allSectionsCompleted && chapter.status === 'completed') {
      chapter.status = 'in progress';
    }

    // Apply other updates to the chapter
    Object.keys(updates).forEach((key) => {
      if (chapter[key] !== undefined) {
        chapter[key] = updates[key];
      }
    });

    // Save the updated chapter
    await chapter.save();
    console.log('Chapter updated successfully:', chapter);

    // Send email if the status was updated
    if (emailNeeded || chapterCompletedEmailNeeded) {
  console.log('Preparing to send email notification...');

  const subject = await Subject.findById(chapter.subjectId).populate('studentId');
  if (!subject || !subject.studentId || subject.studentId.length === 0) {
    return res.status(404).json({ message: 'Related student not found' });
  }

  const student = await Student.findById(subject.studentId[0]);
  console.log('Found student:', student);

  if (!student || !student.email) {
    return res.status(404).json({ message: 'Student email not found' });
  }

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Formatage de la date
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(chapter.statusUpdatedAt);

  let emailSubject, emailText;

  if (chapterCompletedEmailNeeded) {
    emailSubject = `Chapitre complété : ${chapter.title}`;
    emailText = `Bonjour ${student.firstName} ${student.lastName},\n\nFélicitations ! Le chapitre "${chapter.title}" a été complété avec succès le ${formattedDate}.\n\nCordialement,\nVotre équipe pédagogique`;
  } else {
    emailSubject = `Mise à jour du statut : ${chapter.title}`;
    emailText = `Bonjour ${student.firstName} ${student.lastName},\n\nLe statut du chapitre "${chapter.title}" a été mis à jour à "${translateStatus(chapter.status)}" le ${formattedDate}.\n\nCordialement,\nVotre équipe pédagogique`;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: emailSubject,
    text: emailText,
    // Optionnel : ajoutez une version HTML
    html: `
      <p>Bonjour ${student.firstName} ${student.lastName},</p>
      ${chapterCompletedEmailNeeded ? 
        `<p>Félicitations ! Le chapitre <strong>${chapter.title}</strong> a été complété avec succès le ${formattedDate}.</p>` :
        `<p>Le statut du chapitre <strong>${chapter.title}</strong> a été mis à jour à <strong>${translateStatus(chapter.status)}</strong> le ${formattedDate}.</p>`
      }
      <p>Cordialement,<br>Votre équipe pédagogique</p>
    `
  };
      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', student.email);
      } catch (err) {
        console.error('Error sending email:', err.message);
      }
    }

    res.status(200).json({
      model: chapter,
      message: 'Chapter updated successfully!',
    });
  } catch (error) {
    console.error('Error during updateProgressChapter:', error);
    res.status(400).json({ 
      error: error.message, 
      message: 'Failed to update chapter' 
    });
  }
};
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
/**
 * Récupère les chapitres d'une matière spécifique
 */
export const getChaptersBySubject = async (req, res) => {
  try {
    const chapters = await Chapter.find({ subjectId: req.params.subjectId });
    
    res.status(200).json({ 
      model: chapters, 
      message: 'Chapters fetched successfully for subject' 
    });
  } catch (error) {
    res.status(400).json({ 
      error: error.message, 
      message: 'Failed to fetch chapters for subject' 
    });
  }
};

/**
 * Ajoute un chapitre à une matière spécifique
 */
export const addChapterToSubject = async (req, res) => {
  try {
    // Validation des données (ajuster le validateur pour ne pas accepter 'completed')
    const { error } = chapterValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message,
        message: 'Données invalides' 
      });
    }

    // Filtrer les champs autorisés
    const allowedFields = ['title', 'order', 'section', 'subjectId'];
    const chapterData = Object.keys(req.body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Récupération du subjectId
    const subjectId = req.params.subjectId || req.body.subjectId;
    
    if (!subjectId) {
      return res.status(400).json({
        error: 'subjectId manquant',
        message: 'L\'ID de la matière est requis'
      });
    }

    // Vérification que la matière existe
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ 
        error: 'Matière non trouvée',
        message: 'La matière spécifiée n\'existe pas' 
      });
    }

    // Création du chapitre avec les données filtrées
    const chapter = new Chapter({
      ...chapterData,
      subjectId: subjectId
    });

    await chapter.save();
    
    // Ajout du chapitre à la matière
    subject.chapId.push(chapter._id);
    await subject.save();

    res.status(201).json({
      model: chapter,
      message: 'Chapitre ajouté avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout du chapitre:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Échec de l\'ajout du chapitre' 
    });
  }
};
