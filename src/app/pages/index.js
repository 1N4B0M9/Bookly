"use client";

import { useState, useRef, useEffect } from "react";
import UploadForm from "../components/UploadForm";
import Recommendations from "../components/Recommendations";

function Home() {
    const [results, setResults] = useState(null);
    const [image, setImage] = useState(null);
    const [stream, setStream] = useState(null);
    const [uploading, setUploading] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
    }, [stream]);

    // Start the camera
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    };

    // Capture the image from the video feed
    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext("2d");
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const imageData = canvasRef.current.toDataURL("image/png");
            setImage(imageData);
            stopCamera();
        }
    };

    // Convert base64 to a File object
    const dataURLtoFile = (dataUrl, filename) => {
        const arr = dataUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    // Upload the captured image
    const uploadImage = async () => {
        if (!image) return;

        setUploading(true);

        const file = dataURLtoFile(image, "captured_image.png");
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("/api/upload", { method: "POST", body: formData });

            if (!response.ok) throw new Error("Upload failed");

            const result = await response.json();
            setResults(result);
            alert("Image uploaded successfully!");
        } catch (error) {
            console.error("Upload error:", error);
            alert("Image upload failed.");
        } finally {
            setUploading(false);
        }
    };

    // Stop the camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    // Retake photo by starting the camera again
    const retakePhoto = () => {
        setImage(null);
        startCamera(); // Automatically restart the camera
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Bookshelf Scanner 📚</h1>
            <UploadForm onResults={setResults} />

            {/* Camera Controls */}
            <div style={styles.cameraContainer}>
                {!stream && !image && (
                    <button style={styles.button} onClick={startCamera}>Start Camera</button>
                )}
                {stream && (
                    <div>
                        <video ref={videoRef} autoPlay playsInline style={styles.video} />
                        <div style={styles.buttonGroup}>
                            <button style={styles.button} onClick={captureImage}>Capture</button>
                            <button style={styles.button} onClick={stopCamera}>Stop Camera</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Display captured image */}
            {image && (
                <div style={styles.imageContainer}>
                    <h2 style={styles.imageTitle}>Captured Image</h2>
                    <img src={image} alt="Captured" style={styles.image} />
                    <div style={styles.buttonGroup}>
                        <button style={styles.button} onClick={retakePhoto}>Retake</button>
                        <button style={styles.button} onClick={uploadImage} disabled={uploading}>
                            {uploading ? "Uploading..." : "Upload Image"}
                        </button>
                    </div>
                </div>
            )}

            {/* Canvas for capturing image */}
            <canvas ref={canvasRef} style={{ display: "none" }} width="300" height="200"></canvas>

            {results && <Recommendations extractedTitles={results.extracted_titles} />}
        </div>
    );
}

// CSS Styles for Centering and Mobile-Friendly UI
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#000", // Black background
        color: "#fff", // White text
        padding: "20px",
    },
    title: {
        fontSize: "28px",
        fontWeight: "bold",
        marginBottom: "20px",
    },
    cameraContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
    },
    video: {
        width: "100%",
        maxWidth: "350px",
        borderRadius: "10px",
        border: "2px solid #fff", // White border
        boxShadow: "0 4px 10px rgba(255, 255, 255, 0.1)",
    },
    imageContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        marginTop: "20px",
    },
    imageTitle: {
        fontSize: "20px",
        fontWeight: "600",
    },
    image: {
        width: "100%",
        maxWidth: "350px",
        borderRadius: "10px",
        border: "2px solid #fff", // White border
        boxShadow: "0 4px 10px rgba(255, 255, 255, 0.1)",
    },
    buttonGroup: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        gap: "10px",
        marginTop: "10px",
    },
    button: {
        backgroundColor: "#007BFF",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
};

export default Home;
