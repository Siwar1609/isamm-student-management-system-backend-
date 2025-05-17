import user_model from '../../models/users-models/user_model.js'
import {
  deleteUserById,
  getUserById,
  getAllUsers,
  updateUserById,
  addUser,
} from '../../services/users_services.js'

import userValidator from '../../validators/user_validator.js'
import bcrypt from 'bcrypt'

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
      return res.status(404).json({ message: 'User not found' })
    }

    // Prepare update data with only the fields that are present
    const updateData = {}
    
    // Only include fields that are actually present in the request
    if (req.body.cin) updateData.cin = req.body.cin
    if (req.body.firstName) updateData.firstName = req.body.firstName
    if (req.body.lastName) updateData.lastName = req.body.lastName
    if (req.body.email) updateData.email = req.body.email
    if (req.body.phone) updateData.phone = req.body.phone
    if (req.body.birthDate) updateData.birthDate = req.body.birthDate
    if (req.body.address) updateData.address = req.body.address
    if (req.body.secondEmail) updateData.secondEmail = req.body.secondEmail
    if (req.body.photoUrl) updateData.photoUrl = req.body.photoUrl
    if (req.body.status) updateData.status = req.body.status
    if (req.body.role) updateData.role = req.body.role

    // Handle password separately - only if it exists and is not empty string
    if (req.body.password && typeof req.body.password === 'string' && req.body.password.trim() !== '') {
      try {
        updateData.password = await bcrypt.hash(req.body.password, 12)
      } catch (hashError) {
        console.error('Password hashing error:', hashError)
        return res.status(400).json({
          message: 'Invalid password format'
        })
      }
    }

    // Validate update data
    const { error, value } = userValidator.validate(updateData, { 
      allowUnknown: true,
      stripUnknown: true 
    })
    
    if (error) {
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
    console.error('Update error:', err)
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
// Get current admin profile
const getCurrentAdmin = async (req, res) => {
  try {
    console.log('Auth object:', req.auth);
    console.log('User object:', req.user);
    console.log('Request keys:', Object.keys(req));
    console.log('UserId from request:', req.userId);
    
    // Get the admin ID from the request
    const adminId = req.userId || req.auth?.userId || req.auth?.id;
    
    console.log('Admin ID:', adminId);
    
    if (!adminId) {
      return res.status(401).json({ message: 'User ID not found in token. Please login again.' });
    }
    
    const admin = await getUserById(adminId);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.status(200).json(admin);
  } catch (err) {
    console.error('Error getting current admin profile:', err);
    res.status(500).json({ message: err.message });
  }
}
//**************************************** */
// Update current admin profile
const updateCurrentAdmin = async (req, res) => {
  try {
    // Get the admin ID from the auth object
    const adminId = req.auth?.id || req.auth?.userId || req.user?.id;
    
    if (!adminId) {
      return res.status(401).json({ message: 'User ID not found in token. Please login again.' });
    }
    
    // Check if admin exists
    const admin = await user_model.findById(adminId).exec();
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Only allow updating certain fields for self-update
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'secondEmail', 'photoUrl'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Handle password separately
    if (req.body.password && typeof req.body.password === 'string' && req.body.password.trim() !== '') {
      try {
        updateData.password = await bcrypt.hash(req.body.password, 12);
      } catch (hashError) {
        console.error('Password hashing error:', hashError);
        return res.status(400).json({
          message: 'Invalid password format'
        });
      }
    }
    
    // Validate update data
    const { error, value } = userValidator.validate(updateData, { 
      allowUnknown: true,
      stripUnknown: true 
    });
    
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    const updatedAdmin = await updateUserById(adminId, value);
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedAdmin
    });
  } catch (err) {
    console.error('Error updating admin profile:', err);
    res.status(500).json({ message: err.message });
  }
}

//**************************************** */
// Update admin password
const updateAdminPassword = async (req, res) => {
  try {
    // Get the admin ID from the request
    const adminId = req.userId || req.auth?.userId || req.auth?.id;
    
    if (!adminId) {
      return res.status(401).json({ message: 'User ID not found in token. Please login again.' });
    }
    
    const admin = await user_model.findById(adminId).exec();
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    if (!req.body.password || !req.body.confirmPassword) {
      return res.status(400).json({ message: 'Password and confirmation are required' });
    }
    
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    
    // Update only the password
    const updatedAdmin = await user_model.findByIdAndUpdate(
      adminId,
      { password: hashedPassword },
      { new: true }
    ).exec();


    
    res.status(200).json({
      message: 'Password updated successfully' ,
    });
  } catch (err) {
    console.error('Error updating admin password:', err);
    res.status(500).json({ message: err.message });
  }
}
export { getUsers, getUser, createUser, updateUser, deleteUser, getCurrentAdmin , updateCurrentAdmin , updateAdminPassword }
