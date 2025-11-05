import type { Socket } from "socket.io";
import { firebaseAdmin } from "../services";
import type { NextFunction, Request, Response } from "express";
import { JWTService } from "../services/User/JWT.service";
import { UserService } from "../services/User/User.service";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

interface ChatAuthenticatedSocket extends Socket {
  userId?: string;
}

/**
 * Socket.IO middleware for authenticating chat connections using Firebase Auth.
 *
 * @param socket - Socket instance to authenticate
 * @param next - Next function to continue middleware chain
 *
 * @example
 * // Used in Socket.IO middleware setup
 * io.use(chatAuthMiddleware);
 */
export const chatAuthMiddleware = async (
  socket: ChatAuthenticatedSocket,
  next: any
) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;

    if (!token) {
      return next(new Error("AUTHENTICATION_TOKEN_REQUIRED"));
    }

    const decodedToken = await firebaseAdmin.auth.verifyIdToken(token);
    socket.userId = decodedToken.uid;

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("AUTHENTICATION_FAILED"));
  }
};

/**
 * Express middleware for authenticating Firebase users via JWT tokens.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @example
 * // Protect routes with Firebase authentication
 * router.get('/protected-route', chatAuthenticateFirebaseUser, (req, res) => {
 *   res.json({ message: `Hello ${req.userId}!` });
 * });
 */
export const chatAuthenticateFirebaseUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token is required" });
    }

    const token = authHeader.substring(7);
    const payload = JWTService.verifyToken(token, "access");
    const user = await UserService.getUserById(payload.sub);
    
    if (!user) {
      return res.status(401).json({ error: "User account not found" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullname,
      isVerified: user.isVerified,
      profilePicture: user.profilePicture,
      role: user.role || "user",
    };

    req.userId = user.id;
    req.token = token;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
};
