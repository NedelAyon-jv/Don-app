import type { InferOutput } from "valibot";
import type { AuthResponseSchema, AuthTokenSchema, JWTPayloadSchema, LoginSchema, RefreshTokenSchema } from "../schema/auth";

export type LoginInput = InferOutput<typeof LoginSchema>;
export type AuthToken = InferOutput<typeof AuthTokenSchema>;
export type AuthResponse = InferOutput<typeof AuthResponseSchema>;
export type RefreshToken = InferOutput<typeof RefreshTokenSchema>;
export type JWTPayload = InferOutput<typeof JWTPayloadSchema>;
