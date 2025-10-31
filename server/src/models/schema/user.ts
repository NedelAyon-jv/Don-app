import { hash } from "bcrypt";
import { password } from "bun";
import {
  any,
  boolean,
  custom,
  email,
  literal,
  maxLength,
  minLength,
  number,
  object,
  optional,
  pipe,
  regex,
  string,
  transform,
  union,
} from "valibot";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const phoneRegex = /^\+?[\d\s\-()]{10,}$/;

export const BaseUserSchema = object({
  id: string(),
  email: string(),
  password: string(),
  username: string(),
  fullname: string(),
  phone: string(),
  bio: string(),
  profilePicture: string(),
  location: object({
    latitude: number(),
    longitude: number(),
  }),
  rating: object({
    average: number(),
    count: number(),
  }),
  role: string(),
  isVerified: boolean(),
});

export const PublicUserSchema = object({
  id: string(),
  username: string(),
  fullname: string(),
  bio: optional(string()),
  profilePicture: string(),
  rating: optional(
    object({
      average: number(),
      count: number(),
    })
  ),
  isVerified: boolean(),
});

export const MinimalUserSchema = object({
  id: string(),
  username: string(),
  fullname: string(),
  profilePicture: string(),
  isVerified: boolean(),
});

//export const PublicUserSchema = Object({}) should add ???
//export const MinimalUserSchema = Object({}) should add ???

export const UserRegistrationSchema = object({
  email: pipe(
    string("Email must be a string"),
    email("Please enter a valid email address"),
    transform((email) => email.toLocaleLowerCase().trim())
  ),
  password: pipe(
    string("Password must be a string"),
    minLength(8, "Password must be at least 8 characters long"),
    regex(
      passwordRegex,
      "Password must contain at least one uppercase letter, one lowercase letter and one number"
    )
  ),
  username: pipe(
    string("Username must be a string"),
    minLength(3, "Full name must be at least 3 characters long"),
    maxLength(50, "Full name cannot exceed 50 characters"),
    transform((name) => name.trim())
  ),
  fullname: pipe(
    string("Full name must be a string"),
    minLength(2, "Full name must be at least 2 characters long"),
    maxLength(50, "Full name cannot be exceed 50 characters"),
    transform((name) => name.trim())
  ),
  phone: pipe(
    string("Phone must be a string"),
    regex(phoneRegex, "Please enter a valid phone number"),
    transform((phone) => phone.replace(/\s+/g, "").trim())
  ),
});

export const UserLoginSchema = object({
  email: pipe(
    string("Email must be a string"),
    email("Please enter a valid email address"),
    transform((email) => email.toLowerCase().trim())
  ),
  password: string("Password is required"),
});

export const UserUpdateSchema = object({
  email: optional(
    pipe(
      string("Email must be a string"),
      email("Please enter a valid email address"),
      transform((email) => email.toLocaleLowerCase().trim())
    )
  ),
  username: optional(
    pipe(
      string("Username must be a string"),
      minLength(2, "Full name must be at least 2 characters long"),
      maxLength(50, "Full name cannot exceed 50 characters"),
      transform((name) => name.trim())
    )
  ),
  fullname: optional(
    pipe(
      string("Full name must be a string"),
      minLength(2, "Full name must be at least 2 characters long"),
      maxLength(50, "Full name cannot exceed 50 characters"),
      transform((name) => name.trim())
    )
  ),
  phone: optional(
    pipe(
      string("Phone must be a string"),
      regex(phoneRegex, "Please enter a valid phone number"),
      transform((phone) => phone.replace(/\s+/g, "").trim())
    )
  ),
  bio: optional(
    pipe(
      string("Bio must be a string"),
      maxLength(500, "Bio cannot exceed 500 characters"),
      transform((bio) => bio.trim())
    )
  ),
  profilePicture: optional(any()),
  location: optional(
    object({
      latitude: pipe(
        string("Latitude must be a string"),
        transform((val) => parseFloat(val)),
        custom(
          (val) =>
            !isNaN(val as number) &&
            (val as number) >= -90 &&
            (val as number) <= 90,
          "Latitude must be a valid number between -90 and 90"
        )
      ),
      longitude: pipe(
        string("Longitude must be a string"),
        transform((val) => parseFloat(val)),
        custom(
          (val) =>
            !isNaN(val as number) &&
            (val as number) >= -180 &&
            (val as number) <= 180,
          "Longitude must be a valid number between -180 and 180"
        )
      ),
    })
  ),
  rating: optional(
    object({
      average: pipe(number("Average rating must be a number")),
      count: pipe(number("Rating count must be a number")),
    })
  ),
  role: optional(
    pipe(
      string("Type must be a string"),
      union(
        [literal("admin"), literal("user"), literal("donationCenter")],
        "Type must be one of: admin, user, donationCenter"
      )
    )
  ),
  isVerified: optional(
    pipe(
      string("Verified must be a boolean"),
      transform((verified) => verified === "true")
    )
  ),
});

export const PasswordChangeSchema = object({
  currentPassword: string("Current password is required"),
  newPassword: pipe(
    string("New Password must be a string"),
    minLength(8, "New password must be at least 8 characters long"),
    regex(
      passwordRegex,
      "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
  ),
});
