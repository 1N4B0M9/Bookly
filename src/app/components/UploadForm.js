"use client";

import { useState, useRef } from "react";
import axios from "axios";

export default function UploadForm({ onResults, imageAvailable }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file.");

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/upload`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            onResults(response.data);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.uploadContainer}>
            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            {/* Custom "Choose File" Button */}
            <button style={styles.chooseFileButton} onClick={triggerFileSelect}>
                {file ? file.name : "Choose File"}
            </button>

            {/* 
              Conditionally render the Upload button only if:
              1) A file was selected, or
              2) An image was captured via camera (imageAvailable)
            */}
            {(file || imageAvailable) && (
                <button
                    style={styles.uploadButton}
                    onClick={handleUpload}
                    disabled={loading}
                >
                    {loading ? "Uploading..." : "Upload Image"}
                </button>
            )}
        </div>
    );
}

const styles = {
    uploadContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "10px",
        marginTop: "10px",
    },
    chooseFileButton: {
        backgroundColor: "#6f6f6f",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "background 0.3s",
        marginTop: "10px",
        transform: "translateY(-15px)",
    },
    uploadButton: {
        backgroundColor: "#6f6f6f",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "background 0.3s",
        marginTop: "10px",
        transform: "translateY(-15px)",
    },
};
