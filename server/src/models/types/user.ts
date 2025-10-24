import type { InferInput, InferOutput } from "valibot";
import { PasswordChangeSchema, UserLoginSchema, UserRegistrationSchema, UserUpdateSchema, type BaseUserSchema } from "../schema/user";

export type UserRegistrationInput = InferInput<typeof UserRegistrationSchema>;
export type UserLoginInput = InferInput<typeof UserLoginSchema>;
export type UserUpdateInput = InferInput<typeof UserUpdateSchema>;
export type PasswordChangeInput = InferInput<typeof PasswordChangeSchema>;

export type BaseUser = InferOutput<typeof BaseUserSchema>;

export interface GetUserParams {
    userId: string;
}