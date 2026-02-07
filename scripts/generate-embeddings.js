import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pipeline } from "@xenova/transformers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../src/data");
const SPELLS_FILE = path.join(DATA_DIR, "spells.json");
const OUTPUT_FILE = path.join(DATA_DIR, "embeddings.json");

async function generateEmbeddings() {
  console.log("🚀 Loading spells from ontology...");
  const ontology = JSON.parse(fs.readFileSync(SPELLS_FILE, "utf-8"));
  const spells = ontology["@graph"].filter(
    (item) => item["@type"] === "dnd:Spell",
  );

  console.log(`📦 Found ${spells.length} spells.`);

  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
  );

  const textsToEmbed = new Set();
  const records = [];

  for (const spell of spells) {
    // English
    const nameEn = spell.name.en;
    const descEn = (spell.desc.en || []).slice(0, 10).join(" ");
    const textEn = `${nameEn}: ${descEn}`;
    textsToEmbed.add(textEn);

    // French
    const nameFr = spell.name.fr || spell.name.en;
    const descFr = (spell.desc.fr || spell.desc.en || [])
      .slice(0, 10)
      .join(" ");
    const textFr = `${nameFr}: ${descFr}`;
    textsToEmbed.add(textFr);
  }

  const uniqueTexts = Array.from(textsToEmbed);
  console.log(
    `🧠 Computing embeddings for ${uniqueTexts.length} unique text strings...`,
  );

  const BATCH_SIZE = 10;
  for (let i = 0; i < uniqueTexts.length; i += BATCH_SIZE) {
    const batch = uniqueTexts.slice(i, i + BATCH_SIZE);
    console.log(`⏳ Progress: ${i}/${uniqueTexts.length}`);

    const output = await extractor(batch, { pooling: "mean", normalize: true });

    const dims = output.dims; // [batchSize, 384]
    const data = output.data;

    for (let j = 0; j < batch.length; j++) {
      const vector = Array.from(data.slice(j * dims[1], (j + 1) * dims[1]));
      records.push({
        text: batch[j],
        vector: vector,
      });
    }
  }

  console.log(`💾 Saving ${records.length} embeddings to ${OUTPUT_FILE}...`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(records));
  console.log("✅ Done!");
}

generateEmbeddings().catch(console.error);
