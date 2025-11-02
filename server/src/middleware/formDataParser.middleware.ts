import type { Request, Response, NextFunction } from "express";

export class FormDataParserMiddleware {
  static parsePublicationFormData = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const rawData = req.body;

      if (Object.keys(rawData).length > 0) {
        req.body = this.parseFormData(rawData);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  static parseMixedFormData = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const rawData = req.body;

      if (
        rawData.publicationData &&
        typeof rawData.publicationData === "string"
      ) {
        try {
          const parsedData = JSON.parse(rawData.publicationData);
          req.body = parsedData;
        } catch (error) {
          throw new Error("Invalid JSON in publicationData field");
        }
      }

      console.log(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };

  private static parseFormData(data: any): any {
    const parsed: any = { ...data };

    if (typeof data.location === "string") {
      try {
        parsed.location = JSON.parse(data.location);
      } catch (error) {
        throw new Error("Invalid location format. Expected JSON string.");
      }
    }

    if (typeof data.tags === "string") {
      try {
        parsed.tags = JSON.parse(data.tags);
      } catch (error) {
        parsed.tags = data.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean);
      }
    }

    if (typeof data.seeking === "string") {
      try {
        parsed.seeking = JSON.parse(data.seeking);
      } catch (error) {
        parsed.seeking = data.seeking
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);
      }
    }

    if (typeof data.acceptedItems === "string") {
      try {
        parsed.acceptedItems = JSON.parse(data.acceptedItems);
      } catch (error) {
        parsed.acceptedItems = data.acceptedItems
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);
      }
    }

    if (data.quantity) parsed.quantity = Number(data.quantity);
    if (data.targetQuantity)
      parsed.targetQuantity = Number(data.targetQuantity);
    if (data.currentQuantity)
      parsed.currentQuantity = Number(data.currentQuantity);

    if (data.isActive !== undefined) {
      parsed.isActive = data.isActive === "true" || data.isActive === true;
    }

    return parsed;
  }
}

export const formDataParser = {
  publication: FormDataParserMiddleware.parsePublicationFormData,
  mixed: FormDataParserMiddleware.parseMixedFormData,
};
