import type { InferOutput } from "valibot";
import type { UserAuthResponseSchema } from "../schema/auth";

export type UserAuthResponse = InferOutput<typeof UserAuthResponseSchema>;