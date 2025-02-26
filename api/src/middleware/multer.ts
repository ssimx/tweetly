import { AppError } from 'tweetly-shared';
import multer from "multer";
import { Request, Response, NextFunction } from "express";

// Configure Multer storage (optional, using memory storage here)
const storage = multer.memoryStorage(); // or use diskStorage()

// Define the upload middleware
const uploadSingle = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5MB file size limit
    fileFilter: (req: Request, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // accept file
        } else {
            cb(new Error('File format is not supported'));
        }
    },
});

const uploadMultiple = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 4 }, // 5MB file size limit
    fileFilter: (req: Request, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // accept file
        } else {
            cb(new Error('File format is not supported'));
        }
    },
});

export const uploadSingleImageCheckup = (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
        return next(); // Skip multer if no file is being uploaded
    }
    
    uploadSingle.array("image", 1)(req, res, (err: any) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                return next(new AppError(err.message, 400, err.code));
            }
            return next(new AppError("File format is not supported", 400, "INVALID_FILE_FORMAT"));
        }
        next(); // Call next() only if there is no error
    });
};

export const uploadMultipleImagesCheckup = (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
        return next(); // Skip multer if no file is being uploaded
    }

    uploadMultiple.array("image", 4)(req, res, (err: any) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                return next(new AppError(err.message, 400, err.code));
            }
            return next(new AppError("File format is not supported", 400, "INVALID_FILE_FORMAT"));
        }
        next(); // Call next() only if there is no error
    });
};