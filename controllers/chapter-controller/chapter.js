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

// put it here ********************** 
function translateStatus(status) {
  const statusMap = {
    'not yet': 'Pas encore commencé',
    'in progress': 'En cours',
    'completed': 'Terminé'
  };
  return statusMap[status] || status;
}

export const updateProgressChapter = async (req, res) => {
  try {
    const chapterId = req.params.id;
    const { status, sections, ...updates } = req.body;

    console.log('Received update request:', { chapterId, status, sections });

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    let emailNeeded = false;
    let chapterCompletedEmailNeeded = false;

    // Update chapter status
    if (status && status !== chapter.status) {
      chapter.status = status;
      chapter.statusUpdatedAt = new Date();
      emailNeeded = true;
      console.log(`Chapter status updated to ${status}`);
    }

    // Update sections
    if (sections && Array.isArray(sections)) {
      sections.forEach(updatedSection => {
        const sectionToUpdate = chapter.section.id(updatedSection._id);
        if (sectionToUpdate) {
          if (updatedSection.advancement && 
              updatedSection.advancement !== sectionToUpdate.advancement) {
            sectionToUpdate.advancement = updatedSection.advancement;
            sectionToUpdate.statusUpdatedAt = new Date();
            sectionToUpdate.modificationDate = new Date();
            emailNeeded = true;
            console.log(`Section ${sectionToUpdate._id} advancement updated to ${updatedSection.advancement}`);
          }

          if (updatedSection.content) {
            sectionToUpdate.content = updatedSection.content;
          }
        }
      });
    }

    // Check if all sections are completed
    const allSectionsCompleted = chapter.section.every(
      s => s.advancement === 'completed'
    );

    if (allSectionsCompleted && chapter.status !== 'completed') {
      chapter.status = 'completed';
      chapter.statusUpdatedAt = new Date();
      chapterCompletedEmailNeeded = true;
      console.log('Chapter marked as completed automatically');
    }

    await chapter.save();

    // Send email notification if needed
    if (emailNeeded || chapterCompletedEmailNeeded) {
      try {
        console.log('Preparing to send email notification...');

        const subject = await Subject.findById(chapter.subjectId).populate('studentId');
        if (!subject || !subject.studentId || subject.studentId.length === 0) {
          console.error('Related student not found');
          return res.status(404).json({ message: 'Related student not found' });
        }

        const student = await Student.findById(subject.studentId[0]);
        if (!student || !student.email) {
          console.error('Student email not found');
          return res.status(404).json({ message: 'Student email not found' });
        }

        // Configure transporter with secure settings
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          },
          tls: {
            rejectUnauthorized: false // Only for testing, remove in production
          }
        });

        // Verify connection configuration
        transporter.verify(function(error, success) {
          if (error) {
            console.error('SMTP connection error:', error);
          } else {
            console.log('SMTP server is ready to take our messages');
          }
        });

        const formattedDate = new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(chapter.statusUpdatedAt);

        // Email content
        const mailOptions = {
          from: `"EduPlatform" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: chapterCompletedEmailNeeded 
            ? `[EduPlatform] Chapitre complété : ${chapter.title}`
            : `[EduPlatform] Mise à jour de statut : ${chapter.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <p>Bonjour ${student.firstName} ${student.lastName},</p>
              
              ${chapterCompletedEmailNeeded ? 
                `<p>Félicitations ! Vous avez complété le chapitre <strong>"${chapter.title}"</strong> avec succès le ${formattedDate}.</p>` :
                `<p>Le statut du chapitre <strong>"${chapter.title}"</strong> a été mis à jour à <strong>"${translateStatus(chapter.status)}"</strong> le ${formattedDate}.</p>`
              }
              
              <p>Vous pouvez consulter votre progression à tout moment sur la plateforme.</p>
              
              <p style="margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL}/progress" 
                   style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
                   Voir ma progression
                </a>
              </p>
              
              <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
                Cet email est envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </div>
          `,
          // Text fallback for email clients that don't support HTML
          text: chapterCompletedEmailNeeded
            ? `Bonjour ${student.firstName},\n\nFélicitations ! Vous avez complété le chapitre "${chapter.title}" avec succès le ${formattedDate}.\n\nCordialement,\nL'équipe EduPlatform`
            : `Bonjour ${student.firstName},\n\nLe statut du chapitre "${chapter.title}" a été mis à jour à "${translateStatus(chapter.status)}" le ${formattedDate}.\n\nCordialement,\nL'équipe EduPlatform`
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId, 'to:', student.email);

      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Ne pas bloquer la réponse même si l'email échoue
      }
    }

    res.status(200).json({
      model: chapter,
      message: 'Chapter updated successfully!'
    });

  } catch (error) {
    console.error('Error in updateProgressChapter:', error);
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
