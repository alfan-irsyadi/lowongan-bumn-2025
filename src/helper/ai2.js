
import axios from "axios";

const isNode = typeof process !== "undefined" && process?.versions?.node;
let apiKey = "";

// Function to initialize API key (handles async dotenv)
async function initializeApiKey() {
    if (isNode) {
        console.log('node')
        const dotenv = await import("dotenv");
        dotenv.config();
        apiKey = process.env.TOGETHER_API_KEY;
    } else {
        console.log('dari bukan node')
        apiKey = import.meta.env.VITE_TOGETHER_API_KEY;
        // console.log(apiKey)
    }

    // console.log("API Key Loaded:", apiKey); // Debugging log
}

// Ensure the API key is loaded before making requests
const apiKeyPromise = initializeApiKey();

// Function to get AI-determined stream weights
async function getDynamicStreamWeights(userInterest) {
    await apiKeyPromise; // Ensure API key is set before proceeding

    if (!apiKey) {
        console.error("⚠️ API Key is missing! Check your .env settings.");
        return {};
    }

    const prompt = `
A user is interested in "${userInterest}". Assign a weight from 1 to 5 (1 = low, 5 = high) for each job stream below.

${jobStreams.map(stream => `- ${stream}`).join("\n")}

Return only a valid JSON object:
{
    "Developer Information Technology": 5,
    "Analyst Research": 5,
    "Digitalisasi & IT": 4,
    ...
}
`;

    try {
        const response = await axios.post("https://api.together.xyz/v1/chat/completions", {
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
            max_tokens: 300
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            }
        });

        const responseText = response.data.choices[0].message.content;

        // Extract JSON safely
        const jsonMatch = responseText.match(/\{[\s\S]*\}/); // Find text inside { }
        if (!jsonMatch) throw new Error("No valid JSON found in response");

        return JSON.parse(jsonMatch[0]); // Parse only the extracted JSON
    } catch (error) {
        console.error("Error fetching LLM response:", error);
        return {};
    }
}



// List of job streams
export const jobStreams = [
    'Internal Audit',
    'Logistic / Supply Chain / Asset / GA',
    'Corporate Communications/Digital Public Relations/Media Relations',
    'Performance Management',
    'Operasi / Produksi / Proyek',
    'Bisnis Niaga / Pemasaran',
    'Layanan',
    'Treasury',
    'SDM / HC',
    'Aktuaria',
    'Corporate Secretary',
    'Keuangan',
    'Risiko Bisnis / Enterprise Risk',
    'Developer Information Technology',
    'Strategic Planning',
    'Pengembangan Usaha / R&D',
    'Fleet Management',
    'Pengembangan Usaha / R & D',
    'Engineering & Maintenance',
    'Capital Market Investment Banking',
    'Risk Management',
    'Legal & Compliance',
    'Digitalisasi & IT',
    'Analyst Research',
    'Sistem Management & Safety'
];
// Example Usage
getDynamicStreamWeights("data analysis, programming, math, statistic").then((weights) => {
    console.log("AI-determined Stream Weights:", weights);
});

export { getDynamicStreamWeights };
