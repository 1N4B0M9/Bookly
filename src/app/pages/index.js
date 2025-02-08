"use client";

import { useState } from "react";
import UploadForm from "../components/UploadForm";
import Recommendations from "../components/Recommendations";

export default function Home() {
    const [results, setResults] = useState(null);

    return (
        <div>
            <h1>Bookshelf Scanner 📚</h1>
            <UploadForm onResults={setResults} />
            {results && <Recommendations extractedTitles={results.extracted_titles} />}
        </div>
    );
}