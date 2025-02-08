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
    const [recommendationsText, setRecommendationsText] = useState("");
    const recommendationsFullText = "Recommended Books:";

    // Typing effect logic for prompt
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index <= fullText.length) {
                setDisplayText(fullText.slice(0, index));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // Typing effect logic for recommendations heading
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index <= recommendationsFullText.length) {
                setRecommendationsText(recommendationsFullText.slice(0, index));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [recommendations]);

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
            <h2 className="typing-text">{displayText}</h2> {/* Displays the animated text */}
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
                    <h2 className="typing-text">{recommendationsText}</h2>
                    <ul className="recBox" >
                        {recommendations.map((book, idx) => (
                            <li className="bookItems" key={idx}>{book}</li>

                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}