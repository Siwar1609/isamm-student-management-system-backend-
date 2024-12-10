import mongoose from 'mongoose'

// Middleware pour définir l'année académique courante par défaut
export const setAcademicYear = async function (next) {
  if (!this.academicyear) {
    try {
      // Recherche de l'année académique courante
      const currentAcademicYear = await mongoose
        .model('AcademicYear')
        .findOne({ current: true })
      if (currentAcademicYear) {
        this.academicyear = currentAcademicYear._id
      }
    } catch (error) {
      return next(error) // Passer l'erreur à next()
    }
  }
  next() // Passer à l'étape suivante
}
