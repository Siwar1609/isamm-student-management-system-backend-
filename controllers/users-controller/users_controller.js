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
  const { error, value } = userValidator.validate(req.body)

  if (error) {
    return res.status(400).json({ message: error.message })
  }
  try {
    const newUser = await addUser(value)
    res.status(201).json(newUser)
  } catch (err) {
    console.error('something went wrong')
    res.status(500).json({ message: err.message })
  }
}

//**************************************** */
// update a user 🚀
const updateUser = async (req, res) => {
  // check if the user exists
  const user = await user_model.findById(req.params.id).exec()
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  // takes user info and only update the fields that are provided

  let user_old_data = user.toObject()
  // eliminate the _id field
  delete user_old_data._id,
    delete user_old_data.__v,
    delete user_old_data.createdAt,
    delete user_old_data.updatedAt
  let args = req.body
  let user_new_data = {
    ...user_old_data,
    ...args,
  }

  console.log('user_new_data', user_new_data)

  const { error, value } = userValidator.validate(user_new_data)
  if (error) {
    return res.status(400).json({ message: error.message })
  }
  try {
    const updatedUser = await updateUserById(req.params.id, value)
    res.status(200).json(updatedUser)
  } catch (err) {
    res.status(500).json({ message: err.message })
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
