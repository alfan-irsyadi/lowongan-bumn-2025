import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// List of job streams
export const jobStreams = [
    "Developer Information Technology",
    "Analyst Research",
    "Digitalisasi & IT",
    "Sistem Management & Safety",
    "Capital Market Investment Banking",
    "Engineering & Maintenance",
    "Performance Management",
    "Pengembangan Usaha / R & D",
    "Internal Audit",
    "Legal & Compliance",
    "Risk Management",
    "Fleet Management",
    "Logistic / Supply Chain / Asset / GA",
    "Corporate Secretary",
    "Aktuaria",
    "SDM / HC",
    "Treasury",
    "Layanan",
    "Bisnis Niaga / Pemasaran",
    "Operasi / Produksi / Proyek",
    "Corporate Communications/Digital Public Relations/Media Relations"
];

// Function to get AI-determined stream weights
async function getDynamicStreamWeights(userInterest) {
    const prompt = `
        A user is interested in "${userInterest}". Assign a weight (0 = low, 1 = mid, 2 = high) for each job stream below.

        ${jobStreams.map(stream => `- ${stream}`).join("\n")}

        Return only a valid JSON object:
        {
            "Developer Information Technology": 2,
            "Analyst Research": 2,
            "Digitalisasi & IT": 1,
            ...
        }
    `;

    try {
        const response = await fetch("https://api.together.xyz/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`
            },
            body: JSON.stringify({
                model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                messages: [{ role: "user", content: prompt }],
                temperature: 0, // Ensure deterministic responses
                max_tokens: 300
            })
        });

        const data = await response.json();
        const responseText = data.choices[0].message.content;

        // Extract JSON safely
        const jsonMatch = responseText.match(/\{[\s\S]*\}/); // Find text inside { }
        if (!jsonMatch) throw new Error("No valid JSON found in response");

        return JSON.parse(jsonMatch[0]); // Parse only the extracted JSON
    } catch (error) {
        console.error("Error fetching LLM response:", error);
        return {};
    }
}

// Example Usage
getDynamicStreamWeights("data analysis, programming, math, statistic").then(weights => {
    console.log("AI-determined Stream Weights:", weights);
});
