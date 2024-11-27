import User from "../../models/users-model/user_model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET;
//signUp
export const SignUp = async (req, res, next) => {
  try {
    const hashedPWD = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      ...req.body,
      password: hashedPWD,
    });
    await user.save();

    const { password, ...newUser } = user.toObject(); //to delete password from json
    res.status(201).json({ model: newUser, message: "success " });
  } catch (error) {
    res.status(400).json({ error: error.message, message: " problem" });
  }
};

//login
export const login = async (req, res) => {
  try {
    // Find the user by email
    const user = await User.findOne({ login: req.body.login });

    // If user is not found
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if the password is correct
    const valid = await bcrypt.compare(req.body.password, user.password);

    // If password is incorrect
    if (!valid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h", // Set token expiration (e.g., 24 hours)
    });

    // Send token as response
    res.status(200).json({ token });
  } catch (error) {
    // Handle any errors that occur
    res.status(400).json({ message: error.message });
  }
};
