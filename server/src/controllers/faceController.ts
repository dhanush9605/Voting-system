import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Compare face image with registered embedding
// @route   POST /api/face/compare
// @access  Private
export const compareFace = async (req: AuthRequest, res: Response) => {
    try {
        const { imageHash, imageUrl } = req.body;

        // Scaffolding: Call 3rd party API here
        // const response = await axios.post(process.env.FACE_API_URL + '/compare', { ... });

        // Mock verification logic
        const isMatch = true; // In reality verify against user's stored embedding/image
        const confidence = 0.98;

        if (isMatch) {
            res.json({ match: true, confidence });
        } else {
            res.status(400).json({ match: false, confidence });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register face embedding
// @route   POST /api/face/register-embedding
// @access  Private
export const registerFaceEmbedding = async (req: AuthRequest, res: Response) => {
    try {
        const { imageUrl } = req.body;

        // Scaffolding: Generate embedding from image via 3rd party API
        // const embedding = await faceApi.generateEmbedding(imageUrl);

        // Mock success
        res.json({ message: 'Face embedding registered successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
