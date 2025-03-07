import { AppError, isZodError, userUpdateProfileSchema } from 'tweetly-shared';
import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { ZodError } from 'zod';

// Configure Multer storage (optional, using memory storage here)
const storage = multer.memoryStorage(); // or use diskStorage()

// Define the upload middleware
const registerUserUpload = multer({
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

export const registerUserCheckup = (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
        return next(); // Skip multer if no file is being uploaded
    }

    registerUserUpload.array("image", 1)(req, res, (err: any) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                return next(new AppError(err.message, 400, err.code));
            }
            return next(new AppError("File format is not supported", 400, "INVALID_FILE_FORMAT"));
        }
        next(); // Call next() only if there is no error
    });
};


const newPostUpload = multer({
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

export const newPostCheckup = (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
        return next(); // Skip multer if no file is being uploaded
    }

    newPostUpload.fields([
        { name: "images", maxCount: 4 },
    ])(req, res, (err: any) => {
        if (err) {
            return next(err); // Pass any errors to the next middleware (e.g. multer errors)
        }

        // Explicitly type req.files to allow indexing with 'images'
        const files = req.files as { [fieldname: string]: Express.Multer.File[] | undefined }; // Cast files to the expected type

        const text: string | undefined = req.body.text ?? undefined;
        const replyToId: string | undefined = req.body.replyToId ?? undefined;
        const images: Express.Multer.File[] | undefined = files["images"] ?? undefined;

        if ((text === undefined || text.trim().length === 0) && (images === undefined || images.length === 0)) {
            return next(new AppError('Post content is missing', 404, 'MISSING_CONTENT'));
        }

        // Attach parsed fields to req for use in your route handler
        req.body.text = text;
        req.body.replyToId = replyToId;
        req.body.files = images;

        next(); // Proceed to the next middleware/handler
    });
};


const updateProfileUpload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 2 }, // 5MB file size limit
    fileFilter: (req: Request, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // accept file
        } else {
            cb(new Error('File format is not supported'));
        }
    },
});

export const updateProfileCheckup = (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
        return next(); // Skip multer if no file is being uploaded
    }

    updateProfileUpload.fields([
        { name: "profilePicture", maxCount: 1 },
        { name: "bannerPicture", maxCount: 1 },
    ])(req, res, (err: any) => {
        if (err) {
            return next(err); // Pass any errors to the next middleware (e.g. multer errors)
        }

        // Explicitly type req.files to allow indexing with 'images'
        const files = req.files as { [fieldname: string]: Express.Multer.File[] | undefined }; // Cast files to the expected type

        const name: string | undefined = req.body.name ?? undefined;
        const bio: string | undefined = req.body.bio ?? undefined;
        const location: string | undefined = req.body.location ?? undefined;
        const website: string | undefined = req.body.website ?? undefined;
        const removeProfilePicture: string = req.body.removeProfilePicture;
        const removeBannerPicture: string = req.body.removeBannerPicture;

        const profilePicture = files?.profilePicture?.[0] ?? undefined;
        const bannerPicture = files?.bannerPicture?.[0] ?? undefined;
        const images: Express.Multer.File[] = [];
        if (profilePicture) images.push(profilePicture);
        if (bannerPicture) images.push(bannerPicture);

        try {
            userUpdateProfileSchema.parse({ name, bio, location, website, removeProfilePicture: Boolean(removeProfilePicture), removeBannerPicture: Boolean(removeBannerPicture) });
        } catch (error: unknown) {
            next(error);
        }

        // Attach parsed fields to req for use in your route handler
        req.body.name = name;
        req.body.bio = bio;
        req.body.location = location;
        req.body.website = website;
        req.body.removeProfilePicture = removeProfilePicture;
        req.body.removeBannerPicture = removeBannerPicture;
        req.body.files = images;

        next(); // Proceed to the next middleware/handler
    });
};