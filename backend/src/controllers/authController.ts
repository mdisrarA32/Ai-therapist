import { Request, Response } from "express";
import { User } from "../models/User";
import { Session } from "../models/Session";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const user = new User({ name: name.trim(), email: normalizedEmail, password: hashedPassword });
    await user.save();
    // Respond
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      message: "User registered successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.error("Login failed: User not found", normalizedEmail);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error("Login failed: Invalid password", normalizedEmail);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Ensure JWT_SECRET is safely retrieved with fallback for local dev
    const secret = process.env.JWT_SECRET || "your-secret-key";

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn: "24h" }
    );

    // Create session (non-blocking failure)
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

      const session = new Session({
        userId: user._id,
        token,
        expiresAt,
        deviceInfo: req.headers["user-agent"],
      });
      await session.save();
    } catch (sessionError) {
      console.warn("Session creation failed, but login proceeding:", sessionError);
    }

    // Respond with user data and token
    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ message: errorMessage });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      await Session.deleteOne({ token });
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
