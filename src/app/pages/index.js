"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import UploadForm from "../components/UploadForm";
import Recommendations from "../components/Recommendations";
import { Hanken_Grotesk } from "next/font/google";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-hanken",
});

export default function HomePage() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [fileAttached, setFileAttached] = useState(false);
  const [image, setImage] = useState(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");

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
        video: { facingMode },
      });
      setStream(mediaStream);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleCamera = async () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    stopCamera();
    await startCamera();
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setImage(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setImage(null);
    startCamera();
  };

  const returnToHome = () => {
    // Option 1: Actually navigate to '/', effectively refreshing:
    // router.push("/");

    // Option 2: If we're already on '/', just reset everything:
    setResults(null);
    setFileAttached(false);
    setImage(null);
    stopCamera();
  };

  // This is the "New Recommendation" button's handler
  const handleNewRecommendation = () => {
    // Same idea: reset all states so user is back to initial screen
    setResults(null);
    setFileAttached(false);
    setImage(null);
    stopCamera();
  };

  return (
    <div style={styles.container}>
      {/* Always show the logo */}
      <h1 style={styles.title}>
        <img
          src="https://github.com/1N4B0M9/Bookly/blob/main/Assets/Bookly_New_Logo.png?raw=true"
          alt="Bookly Logo"
          style={styles.logo}
        />
      </h1>

      {/* If no results yet, show upload form/camera UI */}
      {!results && (
        <>
          {!stream && (
            <UploadForm
              onResults={setResults}
              hideChooseFileButton={!!image}
              capturedImage={image}
              onFileStatusChange={setFileAttached}
            />
          )}

          <div style={styles.cameraContainer}>
            {!stream && !image && !fileAttached && (
              <button style={styles.button} onClick={startCamera}>
                Start Camera
              </button>
            )}

            {stream && (
              <div style={styles.videoContainer}>
                <video ref={videoRef} autoPlay playsInline style={styles.video} />
                <button style={styles.flipButton} onClick={toggleCamera}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    width="24px"
                    height="24px"
                  >
                    <path d="M12 6V1L8 5l4 4V7c3.3 0 6 2.7 6 6 0 .3 0 .7-.1 1l1.5 1.5c.4-1 .6-2.1.6-3.5 0-4.4-3.6-8-8-8zm-8.4 1.4C2.6 9.6 2 11.3 2 13c0 4.4 3.6 8 8 8v5l4-4-4-4v3c-3.3 0-6-2.7-6-6 0-.3 0-.7.1-1l-1.5-1.5z" />
                  </svg>
                </button>

                <div style={styles.buttonGroup}>
                  <button style={styles.button} onClick={captureImage}>
                    Capture
                  </button>
                  <button style={styles.button} onClick={stopCamera}>
                    Close Camera
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
          />

          {/* 
            The red X that returns to "home"
            is now also black — but we give it white text so it's still visible
          */}
          <button
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              backgroundColor: "black",
              border: "none",
              fontSize: "1.5rem",
              color: "white",
              cursor: "pointer",
              borderRadius: "5px",
              padding: "0.2rem 0.5rem",
            }}
            onClick={returnToHome}
          >
            ✕
          </button>
        </>
      )}

      {/* If we have results, show them + a "New Recommendation" button */}
      {results && (
        <div style={{ marginTop: "80px" }}>
          <Recommendations extractedTitles={results.extracted_titles} />
          <button
            onClick={handleNewRecommendation}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "black",
              color: "#fff",
              borderRadius: "5px",
              cursor: "pointer",
              border: "none",
            }}
          >
            New Recommendation
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    minHeight: "100vh",
    backgroundColor: "#FAF7EE",
    color: "#000",
    position: "relative",
    padding: "20px",
  },
  title: {
    fontSize: "4rem",
    fontWeight: 900,
    color: "black",
    fontFamily: hankenGrotesk.style.fontFamily,
    textAlign: "center",
    whiteSpace: "nowrap",
    marginBottom: "20px",
  },
  logo: {
    maxWidth: "25rem",
    height: "auto",
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
  },
  flipButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    // Black background, white icon
    backgroundColor: "black",
    border: "none",
    borderRadius: "50%",
    padding: "10px",
    cursor: "pointer",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
    marginTop: "10px",
    justifyContent: "center",
  },
  // Now black with white text
  button: {
    backgroundColor: "black",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  imageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    marginTop: "20px",
  },
  imageTitle: {
    color: "#000",
  },
  image: {
    maxWidth: "350px",
    borderRadius: "8px",
  },
};
