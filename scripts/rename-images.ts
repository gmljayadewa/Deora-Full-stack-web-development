import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "public/images/products");

// current filename (lowercase, no extension) -> final filename
const map: Record<string, Record<string, string>> = {
  capsules: {
    ashwagandha: "ashwagandha",
    cinnamon: "cinnamon",
    curryleaves: "curry-leaves",
    gotukola: "gotukola",
    heenbovitiya: "heenbovitiya",
    karavila: "karavila",
    keselmuwa: "keselmuwa",
    lunuwila: "lunuwila",
    moringa: "moringa",
    niwithi: "niwithi",
    thripala: "thripala",
    turmeric: "turmeric",
  },
  tea: {
    amla: "amla",
    cinnamon: "cinnamon",
    gingercoriandar: "ginger-coriander",
    heenbovitiya: "heenbovitiya",
    lotustea: "lotus-tea",
  },
  spices: {
    chaimasala: "chai-masala",
    currypowder: "curry-powder",
    fishcurrypowder: "fish-curry-powder",
    maluambulthiyal: "maluambulthiyal",
    meatcurrypowder: "meat-curry-powder",
    rasam: "rasam",
    roastedcurrypowder: "roasted-curry-powder",
  },
  nutrition: {
    heenbovitiya: "heenbovitiya",
    mixporridge: "mix-porridge",
    poshanakenda: "poshana-kenda",
  },
};

for (const [folder, names] of Object.entries(map)) {
  const dir = path.join(root, folder);
  if (!fs.existsSync(dir)) {
    console.log(`Folder missing: ${folder}`);
    continue;
  }
  for (const file of fs.readdirSync(dir)) {
    const ext = path.extname(file);
    const key = path.basename(file, ext).toLowerCase();
    const target = names[key];
    if (!target) {
      console.log(`No mapping: ${folder}/${file}`);
      continue;
    }
    // two-step rename so case-only changes work on Windows
    const tmp = path.join(dir, `__tmp_${target}${ext}`);
    fs.renameSync(path.join(dir, file), tmp);
    fs.renameSync(tmp, path.join(dir, `${target}.png`));
    console.log(`${folder}/${file} -> ${target}.png`);
  }
}
