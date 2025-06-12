import { NextResponse } from "next/server";
import { verifyToken } from "./auth";

export function withAuth(handler) {
  return async (req, ...args) => {
    try {
      const authHeader = req.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Missing or invalid authorization header" },
          { status: 401 }
        );
      }

      const token = authHeader.split(" ")[1];
      const result = verifyToken(token);

      if (!result.success) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }

      // Add the user info to the request object
      req.user = result.user;
      return handler(req, ...args);
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}
