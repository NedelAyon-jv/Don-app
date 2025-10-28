import { custom, email, number, object, pipe, string, transform } from "valibot";


export const LoginSchema = object({
    email: pipe(
        string('Email must be a string'),
        email('Please enter a valid email address'),
        transform((email) => email.toLocaleLowerCase().trim())
    ),
    password: string('Password must be a string'),
});

export const AuthTokenSchema = object({
    accessToken: string(),
    refreshToken: string(),
    tokenType: string(),
    expiresIn: number()
});

export const AuthResponseSchema = object({
    user: object({
        id: string(),
        email: string(),
        username: string(),
        fullName: string(),
    }),
    token: AuthTokenSchema
});

export const RefreshTokenSchema = object({
    refreshToken: string('Refresh token is required')
});

export const JWTPayloadSchema = object({
    sub: string(), // user id
    email: string(),
    type: pipe(
        string(),
        custom((val) => ['access', 'refresh'].includes(val as string), "Type must be 'access' or 'refresh'")
    ),
    iat: number(), // registrado
    exp: number(), // expiracion
    jti: string(), // id de token
})
