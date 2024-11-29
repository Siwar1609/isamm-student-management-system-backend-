import PFA from '../../models/project_models/project_pfa'
import PFAValidator from '../../validators/project_pfa_validator'

export const fetch_pfa = async (req, res) => {
  try {
    const projects_pfa = await PFA.find()
    res.status(200).json({ model: projects_pfa, message: 'success ' })
  } catch (e) {
    res.status(400).json({ error: e.message, message: 'access problem' })
  }
}

export const get_pfa_ByID = async (req, res) => {
  try {
    const project_pfa = await PFA.findOne({ _id: req.params.id })
      .populate('student', 'teacher', 'document')
      .exec()
    if (!project_pfa) {
      res.status(404).json({
        message: 'Object non Trouvé',
      })
    } else {
      res.status(200).json({
        model: project_pfa,
        message: 'Object Trouvé',
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const add_pfa = async (req, res) => {
  try {
    console.log(req.body)

    // Validation avec Joi
    const validatedData = await PFAValidator.validateAsync(req.body)

    // Création du projet
    const project_pfa = new PFA(validatedData)
    await project_pfa.save()

    // Réponse réussie
    res.status(201).json({ model: project_pfa, message: 'success ' })
  } catch (error) {
    // Gestion des erreurs
    res.status(400).json({
      error: error.message,
      message: 'Données Invalides',
    })
  }
}

export const update_pfa = async (req, res) => {
  try {
    const project_pfa = await PFA.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
      },
    )
    if (!project_pfa) {
      res.status(404).json({
        message: 'Object non Trouvé',
      })
    } else {
      res.status(200).json({
        model: project_pfa,
        message: 'Object modifié',
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const delete_pfa = async (req, res) => {
  try {
    await PFA.deleteOne({ _id: req.params.id })
    res.status(200).json({
      message: 'Object supprimé',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
