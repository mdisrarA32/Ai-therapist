import { Request, Response } from "express";
import { User } from "../models/User";
import { Session } from "../models/Session";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, emergencyContactName, emergencyContactPhone, relationship } = req.body;
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
    const user = new User({ 
      name: name.trim(), 
      email: normalizedEmail, 
      password: hashedPassword,
      emergencyContact: {
        name: emergencyContactName || '',
        phone: emergencyContactPhone || '',
        relationship: relationship || ''
      }
    });
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

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { name, dob, gender, phone, profilePhoto, emergencyContactName, emergencyContactPhone, relationship, emergencyContactEmail } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (dob !== undefined) user.set('dob', dob);
    if (gender !== undefined) user.set('gender', gender);
    if (phone !== undefined) user.set('phone', phone);
    if (profilePhoto !== undefined) user.set('profilePhoto', profilePhoto);

    if (!user.emergencyContact) {
      user.emergencyContact = { name: '', phone: '', relationship: '', email: '' } as any;
    }
    
    if (emergencyContactName !== undefined) user.emergencyContact!.name = emergencyContactName;
    if (emergencyContactPhone !== undefined) user.emergencyContact!.phone = emergencyContactPhone;
    if (relationship !== undefined) user.emergencyContact!.relationship = relationship;
    if (emergencyContactEmail !== undefined) (user.emergencyContact as any).email = emergencyContactEmail;

    await user.save();
    
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        dob: user.get('dob'),
        gender: user.get('gender'),
        phone: user.get('phone'),
        profilePhoto: user.get('profilePhoto'),
        emergencyContact: user.emergencyContact
      },
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
