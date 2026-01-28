import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    label?: string;
}

export function ImageUpload({ onUploadComplete, label = "Upload Image" }: ImageUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validation
        if (!selectedFile.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setFile(selectedFile);
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
        setUploadedUrl(null); // Reset previous upload

        // Auto upload
        await uploadImage(selectedFile);
    };

    const uploadImage = async (fileToUpload: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            const { data } = await api.post('/uploads', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUploadedUrl(data.url);
            onUploadComplete(data.url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image. Please try again.");
            setFile(null);
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const clearImage = () => {
        setFile(null);
        setPreview(null);
        setUploadedUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                </span>
                {uploadedUrl && <Check className="w-4 h-4 text-green-500" />}
            </div>

            {!preview ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-6 hover:bg-muted/50 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 text-center"
                >
                    <div className="p-3 bg-muted rounded-full">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-foreground font-medium">Click to select ID Card</div>
                    <div className="text-xs text-muted-foreground">JPG, PNG up to 5MB</div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
            ) : (
                <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
                    <img
                        src={preview}
                        alt="Preview"
                        className={`w-full h-48 object-cover ${uploading ? 'opacity-50' : ''}`}
                    />

                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    )}

                    {!uploading && (
                        <button
                            onClick={clearImage}
                            type="button"
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
