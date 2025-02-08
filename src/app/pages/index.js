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
    const [facingMode, setFacingMode] = useState("environment"); // "user" or "environment"
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
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    };

    const toggleCamera = async () => {
        setFacingMode(prev => (prev === "user" ? "environment" : "user"));
        stopCamera(); 
        await startCamera(); 
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
            <h1 style={styles.title}>
                <img src={"https://github.com/1N4B0M9/Bookly/blob/main/Assets/Bookly_New_Logo.png?raw=true"} alt="Bookly Logo" style={styles.logo} /> {/* Display the logo */}
                <img
                    src={
                        "https://raw.githubusercontent.com/1N4B0M9/Bookly/d6f2fc9ed05afb2005fb5c48d376d59aa5e6c0cb/Assets/Logo%20-%20svg.svg"
                    }
                    alt="Bookly Logo"
                    style={styles.logo}
                />
            </h1>

            {/* 
              Pass `imageAvailable={!!image}` to control when 
              the Upload button should appear in UploadForm 
            */}
            <UploadForm 
              onResults={setResults} 
              imageAvailable={!!image} 
            />

            <div style={styles.cameraContainer}>
                {!stream && !image && (
                    <button style={styles.button} onClick={startCamera}>
                        Start Camera
                    </button>
                )}

                {stream && (
                    <div style={styles.videoContainer}>
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          style={styles.video} 
                        />
                        {/* Flip Camera Button */}
                        <button style={styles.flipButton} onClick={toggleCamera}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="white"
                                width="24px"
                                height="24px"
                            >
                                <path d="M12 6V1L8 5l4 4V7c3.3 0 6 2.7 6 6 0 .3 0 .7-.1 1l1.5 1.5c.4-1 .6-2.1.6-3.5 0-4.4-3.6-8-8-8zm-8.4 1.4C2.6 9.6 2 11.3 2 13c0 4.4 3.6 8 8 8v5l4-4-4-4v3c-3.3 0-6-2.7-6-6 0-.3 0-.7.1-1l-1.5-1.5z"/>
                            </svg>
                        </button>

                        <div style={styles.buttonGroup}>
                            <button style={styles.button} onClick={captureImage}>
                                Capture
                            </button>
                            <button style={styles.button} onClick={stopCamera}>
                                Stop Camera
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {image && (
                <div style={styles.imageContainer}>
                    <h2 style={styles.imageTitle}>Captured Image</h2>
                    <img src={image} alt="Captured" style={styles.image} />
                    <div style={styles.buttonGroup}>
                        <button style={styles.button} onClick={retakePhoto}>
                            Retake
                        </button>
                    </div>
                </div>
            )}

            <canvas 
              ref={canvasRef} 
              style={{ display: "none" }} 
              width="300" 
              height="200"
            ></canvas>

            {results && <Recommendations extractedTitles={results.extracted_titles} />}
        </div>
    );
}

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
        marginBottom: "40px",
    },
    logo: {
        maxWidth: "25rem",  // Adjust logo size as needed
        height: "auto",     // Maintain aspect ratio
        transform: "translateX(3%)",
    },
    cameraContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
    },
    videoContainer: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    video: {
        width: "100%",
        maxWidth: "350px",
        borderRadius: "10px",
        border: "2px solid #fff",
        boxShadow: "0 4px 10px rgba(255, 255, 255, 0.1)",
    },
    flipButton: {
        position: "absolute",
        top: "10px",
        right: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        border: "none",
        borderRadius: "50%",
        padding: "10px",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    imageContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        marginTop: "20px",
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
    },
};

export default Home;
