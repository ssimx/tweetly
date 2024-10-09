const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const deleteImageFromCloudinary = async (publicId: string) => {
    try {
        const response = await cloudinary.uploader.destroy(publicId);

        if (!response.ok) {
            return response.status(404).json('Image not found');
        }

        return response.status(201).json('Success');
    } catch (error) {
        console.error('Error: ', error);
    }
};