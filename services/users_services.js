import bcrypt from 'bcrypt'
import User from '../models/users-models/user_model.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

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

export const generateRandomPassword = function () {
  //generate a random 12-Character password with at least one uppercase letter, one lowercase letter, one number, and one special character
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return password
}

export const sendEmail = async function ({ to, subject, html }) {
  console.log(`
    Email sent to ${to} with subject: ${subject} 
    `)

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: html,
  })
}

export const updatePassword = async function (id, password, Schema) {
  // generate a new password

  const hashedPassword = await bcrypt.hash(password, 12)

  // update the student password
  const updatedUser = await Schema.findByIdAndUpdate(
    id,
    { password: hashedPassword },
    { new: true },
  )

  // get the student data
  const user = await Schema.findById(id)
  const userFullName = `${user.firstName} ${user.lastName}`
  const htmlEmailContent = generateEmailTemplateResetPassword(
    userFullName,
    password,
  )

  // send the new password to the user
  await sendEmail({
    to: user.email,
    subject: 'Your Password has been updated',
    html: htmlEmailContent,
  })

  return updatedUser
}

export function generateEmailTemplatLoginInfo(fullName, generatedPassword) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
      body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f9;
          color: #333;
      }
      .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
          background-color: #0078d7;
          color: #fff;
          text-align: center;
          padding: 20px;
      }
      .header h1 {
          margin: 0;
          font-size: 1.8rem;
      }
      .content {
          padding: 20px;
          text-align: left;
      }
      .content p {
          margin: 0 0 15px;
          line-height: 1.6;
      }
      .content .highlight {
          color: #0078d7;
          font-weight: bold;
      }
      .footer {
          background-color: #f4f4f9;
          text-align: center;
          padding: 15px;
          font-size: 0.9rem;
          color: #666;
      }
      .footer img {
          display: block;
          margin: 10px auto;
          width: 65px;
          height: 50px;
      }
      .footer p {
          margin: 5px 0;
      }

    .black {
      color: #000;
    }
  </style>
</head>
<body>
  <div class="email-container">
      <div class="header">
          <h1>Welcome to ISAMM Internship Management System</h1>
      </div>
      <div class="content">
          <p lass='black' >Hello Mr/Mrs, ${fullName} Your account has been created successfully. password is : </p>
          <p class="highlight"> ${generatedPassword}</p>
          <span lass='black' >Use your CIN and this password to log in to the system.</span>
          <p class='black'>Cordialement,</p>
          <hr>
          <p class='black'>L'équipe du système de gestion des stages de l'ISAMM - <span style="font-size: 0.7rem; color: #666;">${new Date().toLocaleDateString()}</span></p> 
      </div>
      <div class="footer">
          <img src="https://isa2m.rnu.tn/assets/img/logo-dark.png" alt="ISAMM Logo">
          <p>&copy; ISAMM Internship Management System</p>
      </div>
  </div>
</body>
</html>`
}

export function generateEmailTemplateResetPassword(fullName, password) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
      body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f9;
          color: #333;
      }
      .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
          background-color: #0078d7;
          color: #fff;
          text-align: center;
          padding: 20px;
      }
      .header h1 {
          margin: 0;
          font-size: 1.8rem;
      }
      .content {
          padding: 20px;
          text-align: left;
      }
      .content p {
          margin: 0 0 15px;
          line-height: 1.6;
      }
      .content .highlight {
          color: #0078d7;
          font-weight: bold;
      }
      .footer {
          background-color: #f4f4f9;
          text-align: center;
          padding: 15px;
          font-size: 0.9rem;
          color: #666;
      }
      .footer img {
          display: block;
          margin: 10px auto;
          width: 65px;
          height: 50px;
      }
      .footer p {
          margin: 5px 0;
      }

    .black {
      color: #000;
    }
  </style>
</head>
<body>
  <div class="email-container">
      <div class="header">
          <h1>Welcome to ISAMM Internship Management System</h1>
      </div>
      <div class="content">
          <p lass='black' >Hello Mr/Mrs, ${fullName} Your password has been reset successfully. password is : </p>
          <p class="highlight"> ${password}</p>
          <span lass='black' >Use your CIN and this password to log in to the system.</span>
          <p class='black'>Cordialement,</p>
          <hr>
          <p class='black'>L'équipe du système de gestion des stages de l'ISAMM - <span style="font-size: 0.7rem; color: #666;">${new Date().toLocaleDateString()}</span></p> 
      </div>
      <div class="footer">
          <img src="https://isa2m.rnu.tn/assets/img/logo-dark.png" alt="ISAMM Logo">
          <p>&copy; ISAMM Internship Management System</p>
      </div>
  </div>
</body>
</html>`
}

export function emailTemplate(to, text) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
      body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f9;
          color: #333;
      }
      .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
          background-color: #0078d7;
          color: #fff;
          text-align: center;
          padding: 20px;
      }
      .header h1 {
          margin: 0;
          font-size: 1.8rem;
      }
      .content {
          padding: 20px;
          text-align: left;
      }
      .content p {
          margin: 0 0 15px;
          line-height: 1.6;
      }
      .content .highlight {
          color: #0078d7;
          font-weight: bold;
      }
      .footer {
          background-color: #f4f4f9;
          text-align: center;
          padding: 15px;
          font-size: 0.9rem;
          color: #666;
      }
      .footer img {
          display: block;
          margin: 10px auto;
          width: 65px;
          height: 50px;
      }
      .footer p {
          margin: 5px 0;
      }

    .black {
      color: #000;
    }
  </style>
</head>
<body>
  <div class="email-container">
      <div class="header">
          <h1>Welcome to ISAMM Internship Management System</h1>
      </div>
      <div class="content">
          <p lass='black' >Hello Mr/Mrs, ${to}</p>
          <p class="highlight"> ${text}</p>
          <hr>
          <p class='black'>L'équipe du système de gestion des stages de l'ISAMM - <span style="font-size: 0.7rem; color: #666;">${new Date().toLocaleDateString()}</span></p> 
      </div>
      <div class="footer">
          <img src="https://isa2m.rnu.tn/assets/img/logo-dark.png" alt="ISAMM Logo">
          <p>&copy; ISAMM Internship Management System</p>
      </div>
  </div>
</body>
</html>`
}
