import type { InferInput, InferOutput } from "valibot";
import {
  MinimalUserSchema,
  PasswordChangeSchema,
  PublicUserSchema,
  UserLoginSchema,
  UserRegistrationSchema,
  UserUpdateSchema,
  type BaseUserSchema,
} from "../schema/user";

export type UserRegistrationInput = InferInput<typeof UserRegistrationSchema>;
export type UserLoginInput = InferInput<typeof UserLoginSchema>;
export type UserUpdateInput = InferInput<typeof UserUpdateSchema>;
export type PasswordChangeInput = InferInput<typeof PasswordChangeSchema>;

export type User = InferOutput<typeof BaseUserSchema>;
export type PublicUser = InferOutput<typeof PublicUserSchema>;
export type MinimalUser = InferOutput<typeof MinimalUserSchema>;

export interface GetUserParams {
  userId: string;
}
