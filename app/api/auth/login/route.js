import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req) {
  try {
    console.log("Login: Starting login process");
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      console.error("Login: Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Login: Looking up user by email:", email);
    // Get user
    const user = await convex.query(api.users.getByEmail, { email });
    if (!user) {
      console.error("Login: User not found");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("Login: Verifying password");
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.error("Login: Invalid password");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("Login: Generating JWT token");
    // Generate JWT token
    const token = generateToken(user);

    console.log("Login: Successfully generated token");
    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error.message) {
      console.error("Error message:", error.message);
    }
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}