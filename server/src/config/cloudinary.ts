import { v2 as cloudinary } from 'cloudinary';


console.log("Cloudinary Config Check:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Loaded *****" + process.env.CLOUDINARY_API_KEY.slice(-4) : "MISSING");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Loaded *****" + process.env.CLOUDINARY_API_SECRET.slice(-4) : "MISSING");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
});

export default cloudinary;
