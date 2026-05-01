import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { v4 as uuidv4 } from 'uuid';

// @desc    Upload file to Cloudinary
// @route   POST /api/uploads
// @access  Public (for registration)
export const uploadFile = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        // Convert buffer to base64 for Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'voting-system/id-cards',
            public_id: `id_${uuidv4()}`,
            resource_type: 'auto',
            // timestamp is automatically handled by the SDK usually, or we can just pass nothing to let it default
        });

        res.json({
            message: 'File uploaded successfully',
            url: result.secure_url,
            public_id: result.public_id
        });

    } catch (error: any) {
        console.error("Upload Error Metadata:", {
            filename: req.file?.originalname,
            mimetype: req.file?.mimetype,
            size: req.file?.size
        });
        console.error("Cloudinary Error Detail:", error);
        res.status(500).json({
            message: error.message || 'Image upload failed',
            details: error.error || error.message || 'Internal server error'
        });
    }
};
