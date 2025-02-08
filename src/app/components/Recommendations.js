"use client"
import { useState } from "react";
import axios from "axios";

export default function Recommendations({ extractedTitles }) {
    const [userPreference, setUserPreference] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getRecommendations = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/recommend`, {
                titles: extractedTitles,
                user_preference: userPreference
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
            <h2>Tell us what kind of book you want to read</h2>
            <input
                type="text"
                placeholder="e.g. A thrilling mystery novel"
                value={userPreference}
                onChange={(e) => setUserPreference(e.target.value)}
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