"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import UploadForm from "../components/UploadForm";
import Recommendations from "../components/Recommendations";
import { Hanken_Grotesk } from "next/font/google";

const hankenGrotesk = Hanken_Grotesk({
    subsets: ["latin"],
    weight: ["400", "700", "900"], 
    variable: "--font-hanken", 
});

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

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext("2d");
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const imageData = canvasRef.current.toDataURL("image/png");
            setImage(imageData);
            stopCamera();
        }
    };

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

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const retakePhoto = () => {
        setImage(null);
        startCamera();
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Bookly</h1>
            <UploadForm onResults={setResults} />

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

            <canvas ref={canvasRef} style={{ display: "none" }} width="300" height="200"></canvas>

            {results && <Recommendations extractedTitles={results.extracted_titles} />}

        </div>
    );
}

// CSS Styles
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#FAF7EE",
        color: "#fff",
        padding: "20px",
        backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\"%3E%3Ctext x=\"0\" y=\"25\" font-size=\"30\" font-family=\"Arial\" fill=\"rgba(0, 0, 0, 0.2)\"%3E📚%3C/text%3E%3C/svg%3E')", 
        backgroundRepeat: "repeat",  // Ensures the emoji repeats
        backgroundSize: "200px 200px",
    },
    title: {
        position: "absolute",  
        top: "20px",           
        left: "50%",           
        transform: "translateX(-50%)", 
        fontSize: "4rem",
        fontWeight: 900,      
        color: "black",
        fontFamily: hankenGrotesk.style.fontFamily,
        textAlign: "center",   
        whiteSpace: "nowrap",  
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
        border: "2px solid #fff",
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
        color: "#3f3f3f",
    },
    image: {
        width: "100%",
        maxWidth: "350px",
        borderRadius: "10px",
        border: "2px solid #fff",
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
        backgroundColor: "#6f6f6f",
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
