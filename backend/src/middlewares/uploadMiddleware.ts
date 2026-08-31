import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

export const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 150 * 1024 * 1024, // 150 MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-matroska",
      "video/x-msvideo",
      "video/mpeg",
    ];

    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only valid video files (.mp4, .webm, .mov, .mkv, .ogg) are allowed."));
    }
  },
});
