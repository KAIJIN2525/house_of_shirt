import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ email, password, name });

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // Sign and return the token along with the user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
      (err, token) => {
        if (err) throw err;

        // Send the user and token in response
        res.status(200).json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        });
      }
    );
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    // Skip password check for Google OAuth users
    if (user.googleId) {
      // Create JWT Payload
      const payload = { user: { id: user._id, role: user.role } };

      // Sign and return the token along with the user data
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "12h" },
        (err, token) => {
          if (err) throw err;

          // Send the user and token in response
          res.json({
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
            token,
          });
        }
      );
    } else {
      // For local users, check the password
      const isMatch = await user.matchPassword(password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid Credentials" });

      // Create JWT Payload
      const payload = { user: { id: user._id, role: user.role } };

      // Sign and return the token along with the user data
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "12h" },
        (err, token) => {
          if (err) throw err;

          // Send the user and token in response
          res.json({
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
            token,
          });
        }
      );
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const profile = async (req, res) => {
  res.json(req.user);
};

export const logout = async (req, res) => {};
