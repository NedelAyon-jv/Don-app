import { object, string } from "valibot";

export const UserAuthResponseSchema = object({
    user: object({
        id: string(),
        token: string()
    })
})