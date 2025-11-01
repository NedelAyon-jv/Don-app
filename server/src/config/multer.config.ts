import multer from "multer";

const storage = multer.memoryStorage();

export const multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export const multerConfig = {
  single: (fieldName: string) => multerUpload.single(fieldName),
};
