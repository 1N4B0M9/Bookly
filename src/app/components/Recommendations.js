"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/rec.css";

export default function Recommendations({ extractedTitles }) {
    const [userPreference, setUserPreference] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [displayText, setDisplayText] = useState(""); // For typing effect
    const fullText = "Tell us what kind of book you want to read"; // Full text to type out

    // Typing effect logic
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index <= fullText.length) {
                setDisplayText(fullText.slice(0, index)); // Slice ensures no skipping
                index++;
            } else {
                clearInterval(interval); // Stop the interval when finished
            }
        }, 50); // Adjust speed of typing here
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const getRecommendations = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/recommend`, {
                titles: extractedTitles,
                user_preference: userPreference,
            });

            console.log("API response:", response.data);
            setRecommendations(response.data.recommendations);
        } catch (error) {
            console.error("Recommendation error:", error);
            setError("Failed to fetch recommendations.");
        }

        setLoading(false);
    };

    return (
        <div>
            <h2>{displayText}</h2> {/* Displays the animated text */}
            <input
                type="text"
                placeholder="e.g. A thrilling mystery novel"
                value={userPreference}
                onChange={(e) => setUserPreference(e.target.value)}
                style={{
                    backgroundColor: "white",
                    color: "black",
                    padding: "5px",
                    border: "1px solid black",
                }}
            />
            <button onClick={getRecommendations} disabled={loading}>
                {loading ? "Loading..." : "Get Recommendations"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {recommendations.length > 0 && (
                <div>
                    <h2>Recommended Books:</h2>
                    <ul>
                        {recommendations.map((book, idx) => (
                            <li key={idx}>{book}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
