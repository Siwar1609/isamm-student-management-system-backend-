import user_model from '../../models/users-models/user_model.js'
import {
  deleteUserById,
  getUserById,
  getAllUsers,
  updateUserById,
  addUser,
} from '../../services/users_services.js'

import userValidator from '../../validators/user_validator.js'

//**************************************** */
// get all the users from the database
const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers()
    res.status(200).json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

//**************************************** */
// get a user by id ➡
const getUser = async (req, res) => {
  const userId = req.params.id
  try {
    const user = await getUserById(userId)
    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
//**************************************** */

// create a new user ✅
const createUser = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = userValidator.validate(req.body)
    if (error) {
      console.log('Validation error:', {
        details: error.details,
        data: req.body
      })
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      })
    }

    // Add default status if not provided
    const userData = {
      ...value,
      status: value.status || 'active'
    }

    console.log('Creating user with data:', userData)
    const newUser = await addUser(userData)
    
    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    })
  } catch (err) {
    console.error('User creation error:', {
      error: err,
      stack: err.stack,
      data: req.body
    })

    // Handle specific errors
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'User already exists',
        field: Object.keys(err.keyPattern)[0]
      })
    }

    res.status(500).json({
      message: 'Failed to create user',
      error: err.message
    })
  }
}

// update a user 🚀
const updateUser = async (req, res) => {
  try {
    // Check if user exists
    const user = await user_model.findById(req.params.id).exec()
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        userId: req.params.id
      })
    }

    // Prepare update data
    const user_old_data = user.toObject()
    const updateData = {
      ...user_old_data,
      ...req.body,
      _id: undefined,
      __v: undefined,
      createdAt: undefined,
      updatedAt: undefined
    }

    // Validate update data
    const { error, value } = userValidator.validate(updateData)
    if (error) {
      console.log('Update validation error:', {
        details: error.details,
        data: updateData
      })
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      })
    }

    const updatedUser = await updateUserById(req.params.id, value)
    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    })
  } catch (err) {
    console.error('User update error:', {
      error: err,
      stack: err.stack,
      userId: req.params.id,
      data: req.body
    })

    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Update failed: duplicate field',
        field: Object.keys(err.keyPattern)[0]
      })
    }

    res.status(500).json({
      message: 'Failed to update user',
      error: err.message
    })
  }
}
//**************************************** */
// delete a user ⛔
const deleteUser = async (req, res) => {
  const userId = req.params.id
  try {
    const deletedUser = await deleteUserById(userId)
    res.status(200).json(deletedUser)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
//**************************************** */
export { getUsers, getUser, createUser, updateUser, deleteUser }
