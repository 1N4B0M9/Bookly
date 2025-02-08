"use client";

import { useState, useRef } from "react";
import axios from "axios";

export default function UploadForm({
  onResults,
  capturedImage,
  hideChooseFileButton = false,
  onFileStatusChange = () => {},
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    onFileStatusChange(!!selectedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // Helper to convert a base64 dataURL to a Blob
  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      if (file) {
        formData.append("file", file);
      } else if (capturedImage) {
        const blob = dataURLToBlob(capturedImage);
        formData.append("file", blob, "captured_image.png");
      } else {
        alert("No file or captured image to upload!");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      onResults(response.data);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading image.");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    fileInputRef.current.value = "";
    onFileStatusChange(false);
  };

  return (
    <div style={styles.uploadContainer}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Show "Choose File" only if hideChooseFileButton is false */}
      {!hideChooseFileButton && (
        <button style={styles.chooseFileButton} onClick={triggerFileSelect}>
          {file ? file.name : "Choose File"}
        </button>
      )}

      {file && (
        <button style={styles.removeButton} onClick={removeFile}>
          &times;
        </button>
      )}

      {(file || capturedImage) && (
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
  // --- Changed to black background, white text ---
  chooseFileButton: {
    backgroundColor: "black",
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
  // --- Keep remove button as is (red) ---
  removeButton: {
    backgroundColor: "black",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    textAlign: "center",
    fontSize: "20px",
    lineHeight: "28px",
    marginTop: "10px",
    transform: "translateY(-15px)",
  },
  // --- Changed to black background, white text ---
  uploadButton: {
    backgroundColor: "black",
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