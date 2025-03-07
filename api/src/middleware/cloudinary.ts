import dotenv from "dotenv"
import { Request, Response, NextFunction } from "express";
import {
    v2 as cloudinary, UploadApiResponse,
    UploadApiErrorResponse
} from 'cloudinary';
import { AppError } from 'tweetly-shared';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryFile extends Express.Multer.File {
    buffer: Buffer;
};

export const uploadToCloudinary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files: CloudinaryFile[] = req.body.files as CloudinaryFile[];
        if (!files || files.length === 0) {
            return next();
        }

        const cloudinaryUrls: string[] = [];
        for (const file of files) { 
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'tweetly',
                } as any,
                (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (err) {
                        return next(new AppError('Upload error', 400, 'UPLOAD_ERROR'));
                    }
                    if (!result) {
                        return next(new AppError('Cloudinary upload result is undefined', 400, 'UPLOAD_UNDEFINED'));
                    }

                    if (file.fieldname.startsWith('profile')) {
                        req.body.profilePicture = result.secure_url;
                    } else if (file.fieldname.startsWith('banner')) {
                        req.body.bannerPicture = result.secure_url;
                    }
                    
                    cloudinaryUrls.push(result.secure_url);

                    if (cloudinaryUrls.length === files.length) {
                        //All files processed now get your images here
                        req.body.cloudinaryUrls = cloudinaryUrls;
                        next();
                    }
                }
            );
            uploadStream.end(file.buffer);
        }
    } catch (error) {
        next(new AppError('Something went wrong', 500, 'UNKNOWN_ERROR'));
    }
};