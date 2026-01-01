import multer from "multer";

const storage = multer.diskStorage({
  destination: "data/resumes",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });
