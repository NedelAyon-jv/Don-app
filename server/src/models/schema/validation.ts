import {
  array,
  custom,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  pipe,
  string,
} from "valibot";
import { ValidationMiddleware } from "../../middleware/validation.middleware";

export const commonValidations = {
  pagination: ValidationMiddleware.validateQuery(
    object({
      page: optional(pipe(number(), minValue(1))),
      limit: optional(pipe(number(), minValue(1), maxValue(100))),
      sort: optional(string()),
      order: optional(
        pipe(
          string(),
          custom((val) => ["asc", "desc"].includes(val as any))
        )
      ),
    })
  ),

  idParams: ValidationMiddleware.validateParams(
    object({
      id: pipe(string(), minLength(1)),
    })
  ),

  search: ValidationMiddleware.validateQuery(
    object({
      q: optional(pipe(string(), minLength(1))),
      category: optional(string()),
      tags: optional(array(string())),
    })
  ),

  imageUpload: ValidationMiddleware.validateFiles({
    maxCount: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  }),

  documentUpload: ValidationMiddleware.validateFiles({
    maxCount: 3,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  }),
};
