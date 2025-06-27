// ─── Skill name ↔ ID map ─────────────────────────────────────────────────────
const dictSkill = {
  "Attack Boost":1, "Agitator":2, /* …snip… */ "Strife":145, "Shock Absorber":146,
  "Inspiration":147
};

// invert for JSON→TXT
const idToName = {};
for (let name in dictSkill) {
  idToName[dictSkill[name]] = name;
}
// ──────────────────────────────────────────────────────────────────────────────

const fileInput   = document.getElementById("fileInput");
const rarityInput = document.getElementById("rarityInput");
const btn         = document.getElementById("convertBtn");
const log         = document.getElementById("log");

// enable button once a file is loaded
fileInput.addEventListener("change", () => {
  btn.disabled = !fileInput.files.length;
  log.textContent = "";
});

btn.addEventListener("click", async () => {
  const file   = fileInput.files[0];
  const text   = await file.text();
  const rarity = parseInt(rarityInput.value, 10) || 0;

  let outText, fileName;

  // Try JSON→TXT first
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw 0;

    // Expect objects with Skills, SkillLevels, Slots
    outText = data.map(obj => {
      const [id1,id2] = obj.Skills || [];
      const [lv1,lv2] = obj.SkillLevels || [];
      const [s1,s2,s3] = obj.Slots || [];
      const name1 = idToName[id1] || `UNKNOWN(${id1})`;
      const name2 = idToName[id2] || `UNKNOWN(${id2})`;
      return [name1, lv1, name2, lv2, s1, s2, s3].join(",");
    }).join("\n");
    fileName = "skills.txt";
    log.textContent = `✅ Parsed JSON → ${data.length} text lines\n`;
  }
  catch {
    // Fallback to CSV/text → JSON
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    const out   = [];

    for (let ln of lines) {
      const cols = ln.split(",").map(c => c.trim());
      if (cols.length !== 7) {
        log.textContent += `⚠ Skipped invalid line: "${ln}"\n`;
        continue;
      }
      const [n1,l1,n2,l2,s1,s2,s3] = cols;
      if (!(n1 in dictSkill) || !(n2 in dictSkill)) {
        log.textContent += `❌ Unknown skill: "${n1}" or "${n2}"\n`;
        return;
      }
      out.push({
        Rarity:      rarity,
        SkillLevels:[+l1, +l2],
        Skills:      [dictSkill[n1], dictSkill[n2]],
        Slots:       [+s1, +s2, +s3]
      });
    }
    outText  = JSON.stringify(out, null, 2);
    fileName = "skills.json";
    log.textContent = `✅ Parsed text → ${out.length} JSON entries\n`;
  }

  // trigger download
  const blob = new Blob([outText], { type: fileName.endsWith(".json") 
                                      ? "application/json" 
                                      : "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
