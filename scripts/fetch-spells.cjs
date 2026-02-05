const axios = require("axios");
const fs = require("fs");
const path = require("path");

const GRAPHQL_URL = "https://www.dnd5eapi.co/graphql";
const OUTPUT_FILE = path.join(__dirname, "../src/data/spells.en.json");

const query = `
  query {
    spells(limit: 500) {
      index
      name
      level
      desc
      range
      components
      material
      ritual
      duration
      concentration
      casting_time
      school {
        index
        name
      }
      classes {
        index
        name
      }
    }
  }
`;

async function fetchSpells() {
  console.log("🔮 Fetching all spells from D&D 5e API (GraphQL)...");
  try {
    const response = await axios.post(
      GRAPHQL_URL,
      { query },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const spells = response.data.data.spells;
    console.log(`✅ Successfully fetched ${spells.length} spells.`);

    // Sort by level then name for consistency
    spells.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(spells, null, 2));
    console.log(`💾 Spells saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("❌ Error fetching spells:", error.message);
    process.exit(1);
  }
}

fetchSpells();
