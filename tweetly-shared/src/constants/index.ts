// Supported image types

export const ALLOWED_IMAGE_TYPES = [
    // Common web formats
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",

    // Apple formats
    "image/heic",
    "image/heif",

    // Vector graphics
    "image/svg+xml",

    // Legacy and specialty formats
    "image/bmp",
    "image/tiff",
    "image/tif",
    "image/x-icon",
    "image/vnd.microsoft.icon", // ICO files

    // Raw camera formats (if you want to support photographers)
    "image/x-canon-cr2",
    "image/x-canon-cr3",
    "image/x-nikon-nef",
    "image/x-sony-arw",
    "image/x-adobe-dng",

    // Other formats
    "image/x-ms-bmp", // Alternative MIME type for BMP
    "image/jp2", // JPEG 2000
    "image/jpx", // JPEG 2000 Part 2
    "image/jpm", // JPEG 2000 Part 6
    "image/avif" // AV1 Image File Format (newer efficient format)
];