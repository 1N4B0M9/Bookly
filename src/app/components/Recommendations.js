"use client"
import { useState } from "react";
import axios from "axios";

export default function Recommendations({ extractedTitles }) {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    const getRecommendations = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/recommend`, { titles: extractedTitles });
            setRecommendations(response.data.recommendations);
        } catch (error) {
            console.error("Recommendation error:", error);
            alert("Error getting recommendations.");
        }
        setLoading(false);
    };

    return (
        <div>
            <h2>Extracted Books:</h2>
            <ul>
                {extractedTitles.map((title, idx) => (
                    <li key={idx}>{title}</li>
                ))}
            </ul>
            <button onClick={getRecommendations} disabled={loading || extractedTitles.length === 0}>
                {loading ? "Fetching..." : "Get Recommendations"}
            </button>

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