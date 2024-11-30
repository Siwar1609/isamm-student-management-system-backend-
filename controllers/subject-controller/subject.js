import Subject from '../../models/subject-models/subject_model.js'

export const addSubject = async (req, res) => {
  try {
    // Log the request body (optional, for debugging purposes)
    console.log('body: ', req.body)

    // Create a new Subject instance with the data from the request body
    const subject = new Subject(req.body)

    // Save the subject to the database
    await subject.save()

    // Return a success response with the created subject
    res.status(201).json({
      subject, // Send the created subject object back in the response
      message: 'Subject added successfully',
    })
  } catch (error) {
    // Return an error response in case of failure
    res.status(400).json({
      error: error.message,
      message: 'Invalid data!',
    })
  }
}
export const deleteSubject = async (req, res) => {
    try {
      // Attempt to delete the subject by its ID
      const subject = await Subject.findByIdAndDelete(req.params.id);
  
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
  
      res.status(200).json({ model: subject, message: "Subject Deleted" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  

export const fetchSubjects = async (req, res) => {
  try {
    const subject = await Subject.find()
    res.status(200).json({ model: subject, message: 'Success !' })
  } catch (e) {
    res.status(200).json({
      error: e.message,
      message: 'Access Problem !',
    })
  }
}

export const getSubjectbyID = async (req, res) => {
  try {
    console.log('id: ', req.params.id)
    const subject = await Subject.findOne({ _id: req.params.id })
      .populate('skillId')
      .populate('curriculumId')
      .exec()
    if (!subject) {
      res.status(404).json({ model: subject, message: 'Success !' })
    } else {
      res.status(200).json({
        model: subject,
        message: 'Here is the Object !',
      })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
export const updateSubject = async (req, res) => {
  try {
    console.log('body: ', req.body)
    console.log('id:', req.params.id)
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
      },
    )
    if (!subject) {
      res.status(404).json({ message: 'Failed to Find the Subject' })
    } else {
        res.status(200).json({ message: "Subject Deleted" })}

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
