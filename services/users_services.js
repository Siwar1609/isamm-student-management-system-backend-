import bcrypt from 'bcrypt'
import User from '../models/users-models/user_model.js'

export const addUser = async function (value) {
  // validating the args
  console.log('cin : ', value.cin)

  if (!value.email || !value.password || !value.role) {
    return res.status(400).json({ message: 'All fields are required' })
  }
  // checking if the user already exists
  const user = await User.findOne({ email: value.email }).exec()
  if (user) {
    return res.status(400).json({ message: 'User already exists' })
  }
  // hashing the password
  const hashedPassword = await bcrypt.hash(value.password, 10)
  // creating the user
  const newUser = new User({
    ...value,
    password: hashedPassword,
  })

  console.log(newUser)

  await newUser.save()

  console.log('sending email')
  console.log('newUser', newUser)

  // sending the email
  /*
    //   const message = {
  //     from: 'flen@gmail.com',
  //     to: req.body.email,
  //     subject: 'Account created',
  //     text: 'Your account has been created successfully',
  //     html: `
  //     <style>
  //     h1{
  //       color: #0d6efd;
  //     }
  //     p{
  //       color: #0d6efd;
  //     }

  //     </style>
  //     <h1>Welcome to isamm-platform</h1>
  //     <br/>
  //     <p>your email is <strong>${args.email} </strong></p>
  //     <p>your password is  <strong>${args.password}</strong></p>
  //     <br/>
  //     <hr/>
  //     <p>you can login now and start using the platform</p>
  //     <p>If there is any problem please contact the admin
  //     on : flen@gmail.com  </p>

  //     `,
  //   }
    **********************************
    Logic for sending the email
    wil be added here
    **********************************

  */
  // saving the user

  return newUser
}

// This is a function that will be used to get the user by id from the database
export const getUserById = async (userID) => {
  return await User.findById(userID).exec()
}

// the delete user service function takes the user id as an argument and deletes the user from the database

export const deleteUserById = async (userID) => {
  return await User.findByIdAndDelete(userID).exec()
}
// the update user service function takes the user id and the updated user object as arguments and updates the user in the database
export const updateUserById = async (userID, args) => {
  const hashedPassword = await bcrypt.hash(args.password, 10)
  args.password = hashedPassword

  console.log('args', args)

  return await User.findByIdAndUpdate(userID, args, {
    new: true,
  }).exec()
}
// the get all users service function returns all the users in the database
export const getAllUsers = async () => {
  return await User.find().exec()
}
