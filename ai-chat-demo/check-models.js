import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error("No API key found in environment variables.");
  process.exit(1);
}

console.log("Testing API key starting with:", apiKey.substring(0, 15) + "...");

async function listModels() {
  try {
    const response = await fetch("https://api.anthropic.com/v1/models", {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error("Response body:", text);
      return;
    }

    const data = await response.json();
    console.log("Available models:");
    data.data.forEach(model => {
      console.log(`- ${model.id} (${model.display_name})`);
    });
  } catch (error) {
    console.error("Failed to fetch models:", error);
  }
}

listModels();
