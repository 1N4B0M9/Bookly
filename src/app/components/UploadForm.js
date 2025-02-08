"use client";

import { useState } from "react";
import axios from "axios";

export default function UploadForm({ onResults }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file.");
        
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            onResults(response.data);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading image.");
        }
        setLoading(false);
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload Image"}
            </button>
        </div>
    );
}