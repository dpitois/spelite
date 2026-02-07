const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../src/data");
const EN_FILE = path.join(DATA_DIR, "spells.en.json");
const FR_FILE = path.join(DATA_DIR, "spells.fr.json");
const OUTPUT_FILE = path.join(DATA_DIR, "spells.json");
const EXTRACTIONS_FILE = path.join(__dirname, "extracted_translations.json");

let extractions = {};
if (fs.existsSync(EXTRACTIONS_FILE)) {
  extractions = JSON.parse(fs.readFileSync(EXTRACTIONS_FILE, "utf-8"));
  console.log(
    `💡 Loaded ${Object.keys(extractions).length} manual translations from temp.`,
  );
}

function extractMechanics(spellEn, spellFr) {
  const descEn = spellEn.desc.join(" ");
  const descFr = (spellFr?.desc || []).join(" ");

  const mechanics = {
    has_attack_roll: false,
    has_save: false,
    save_ability: undefined,
    damage_type: undefined,
    damage_dice: undefined,
    area_of_effect: undefined,
    higher_levels: spellEn.desc.some((d) =>
      d.toLowerCase().includes("at higher levels"),
    ),
  };

  // Attack Roll detection
  if (/spell attack/i.test(descEn) || /attaque de sort/i.test(descFr)) {
    mechanics.has_attack_roll = true;
    if (/melee/i.test(descEn) || /au corps à corps/i.test(descFr)) {
      mechanics.attack_type = "melee";
    } else if (/ranged/i.test(descEn) || /à distance/i.test(descFr)) {
      mechanics.attack_type = "ranged";
    }
  }

  // Saving Throw detection
  const saveMatch = descEn.match(
    /(strength|dexterity|constitution|intelligence|wisdom|charisma) saving throw/i,
  );
  if (saveMatch) {
    mechanics.has_save = true;
    const ability = saveMatch[1].toLowerCase();
    const map = {
      strength: "str",
      dexterity: "dex",
      constitution: "con",
      intelligence: "int",
      wisdom: "wis",
      charisma: "cha",
    };
    mechanics.save_ability = map[ability] || undefined;
  }

  // Damage Type and Dice detection
  const damageTypes = [
    "acid",
    "bludgeoning",
    "cold",
    "fire",
    "force",
    "lightning",
    "necrotic",
    "piercing",
    "poison",
    "psychic",
    "radiant",
    "slashing",
    "thunder",
  ];

  for (const type of damageTypes) {
    const diceRegex = new RegExp(`(\\d+d\\d+)\\s*${type}\\s*damage`, "i");
    const diceMatch = descEn.match(diceRegex);
    if (diceMatch) {
      mechanics.damage_type = type;
      mechanics.damage_dice = diceMatch[1];
      break;
    }
    const damageRegex = new RegExp(
      `\\b${type}\\b.*damage|damage.*\\b${type}\\b`,
      "i",
    );
    if (damageRegex.test(descEn)) {
      mechanics.damage_type = type;
      break;
    }
  }

  // Area of Effect detection
  const aoeTypes = ["sphere", "cone", "cylinder", "line", "cube", "wall"];
  for (const aoeType of aoeTypes) {
    const aoeRegex = new RegExp(`(\\d+)-foot(?:-radius)?\\s*${aoeType}`, "i");
    const aoeMatch = descEn.match(aoeRegex);
    if (aoeMatch) {
      mechanics.area_of_effect = {
        type: aoeType,
        value: parseInt(aoeMatch[1], 10),
        unit: "foot",
      };
      break;
    }
  }

  return mechanics;
}

function buildOntology() {
  console.log("🏗️  Building Spell Ontology (with manual translations)...");

  if (!fs.existsSync(EN_FILE) || !fs.existsSync(FR_FILE)) {
    console.error("❌ Source files missing (EN or FR).");
    process.exit(1);
  }

  const spellsEn = JSON.parse(fs.readFileSync(EN_FILE, "utf-8"));
  const spellsFr = JSON.parse(fs.readFileSync(FR_FILE, "utf-8"));
  const frMap = new Map(spellsFr.map((s) => [s.index, s]));

  const graph = spellsEn.map((sEn) => {
    const sFr = frMap.get(sEn.index);
    const manual = extractions[sEn.index];
    const mechanics = extractMechanics(sEn, sFr);

    // Use manual extraction if available, otherwise fallback to FR file, otherwise fallback to EN
    const nameFr = manual?.name_fr || (sFr ? sFr.name : sEn.name);
    const descFr = manual?.desc_fr || (sFr ? sFr.desc : sEn.desc);
    const rangeFr = manual?.range_fr || (sFr ? sFr.range : sEn.range);
    const durationFr =
      manual?.duration_fr || (sFr ? sFr.duration : sEn.duration);
    const castingTimeFr =
      manual?.casting_time_fr || (sFr ? sFr.casting_time : sEn.casting_time);
    const materialFr =
      manual?.material_fr || (sFr ? sFr.material : sEn.material);

    return {
      "@id": `spells:${sEn.index}`,
      "@type": "dnd:Spell",
      index: sEn.index,
      level: sEn.level,
      school: sEn.school.index,
      components: sEn.components,
      ritual: sEn.ritual,
      concentration: sEn.concentration,
      classes: sEn.classes.map((c) => c.index),
      mechanics,
      name: { en: sEn.name, fr: nameFr },
      desc: { en: sEn.desc, fr: descFr },
      range: { en: sEn.range, fr: rangeFr },
      duration: { en: sEn.duration, fr: durationFr },
      casting_time: { en: sEn.casting_time, fr: castingTimeFr },
      material: { en: sEn.material || null, fr: materialFr || null },
    };
  });

  const database = {
    "@context": {
      dnd: "https://purl.org/dnd/ontology#",
      spells: "https://purl.org/dnd/spells/",
      mechanics: "dnd:hasMechanics",
      save: "dnd:savingThrow",
      attack: "dnd:attackRoll",
      damage: "dnd:damageType",
      dice: "dnd:damageDice",
      aoe: "dnd:areaOfEffect",
      value: "dnd:value",
      unit: "dnd:unit",
    },
    "@graph": graph,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(database, null, 2));
  console.log(`✅ Ontology built successfully: ${graph.length} spells.`);

  // Auto-generate embeddings after building ontology
  console.log("🔄 Triggering embedding generation...");
  const { execSync } = require("child_process");
  try {
    execSync("node scripts/generate-embeddings.js", { stdio: "inherit" });
  } catch (err) {
    console.error("❌ Failed to generate embeddings:", err.message);
  }
}

buildOntology();
