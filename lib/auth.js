import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}