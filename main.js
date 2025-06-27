// ─── Skill name ↔ ID lookup ────────────────────────────────────────────────────
const dictSkill = {
  "":0, "Attack Boost":1, "Agitator":2, "Peak Performance":3, "Resentment":4,
  "Resuscitate":5,"Critical Eye":6,"Critical Boost":7,"Weakness Exploit":8,
  "Latent Power":9,"Maximum Might":10,"Critical Element":11,"Master's Touch":12,
  "Fire Attack":13,"Water Attack":14,"Ice Attack":15,"Thunder Attack":16,
  "Dragon Attack":17,"Poison Attack":18,"Paralysis Attack":19,"Sleep Attack":20,
  "Blast Attack":21,"Handicraft":22,"Razor Sharp":23,"Spare Shot":24,
  "Protective Polish":25,"Mind's Eye":26,"Ballistics":27,"Bludgeoner":28,
  "Bow Charge Plus":29,"Focus":30,"Power Prolonger":31,"Marathon Runner":32,
  "Constitution":33,"Stamina Surge":34,"Guard":35,"Guard Up":36,
  "Offensive Guard":37,"Critical Draw":38,"Punishing Draw":39,"Quick Sheathe":40,
  "Slugger":41,"Stamina Thief":42,"Affinity Sliding":43,"Horn Maestro":44,
  "Artillery":45,"Load Shells":46,"Special Ammo Boost":47,"Normal/Rapid Up":48,
  "Pierce Up":49,"Spread Up":50,"Ammo Up":51,"Reload Speed":52,"Recoil Down":53,
  "Steadiness":54,"Rapid Fire Up":55,"Defense Boost":56,"Divine Blessing":57,
  "Recovery Up":58,"Recovery Speed":59,"Speed Eating":60,"Earplugs":61,
  "Windproof":62,"Tremor Resistance":63,"Bubbly Dance":64,"Evade Window":65,
  "Evade Extender":66,"Fire Resistance":67,"Water Resistance":68,"Ice Resistance":69,
  "Thunder Resistance":70,"Dragon Resistance":71,"Blight Resistance":72,
  "Poison Resistance":73,"Paralysis Resistance":74,"Sleep Resistance":75,
  "Stun Resistance":76,"Muck Resistance":77,"Blast Resistance":78,"Botanist":79,
  "Geologist":80,"Partbreaker":81,"Capture Master":82,"Carving Master":83,
  "Good Luck":84,"Speed Sharpening":85,"Bombardier":86,"Mushroomancer":87,
  "Item Prolonger":88,"Wide-Range":89,"Free Meal":90,"Heroics":91,"Fortify":92,
  "Flinch Free":93,"Jump Master":94,"Carving Pro":95,"Hunger Resistance":96,
  "Leap of Faith":97,"Diversion":98,"Master Mounter":99,"Chameleos Blessing":100,
  "Kushala Blessing":101,"Teostra Blessing":102,"Dragonheart":103,
  "Wirebug Whisperer":104,"Wall Runner":105,"Counterstrike":106,
  "Rapid Morph":107,"Hellfire Cloak":108,"Wind Alignment":109,
  "Thunder Alignment":110,"Stormsoul":111,"Blood Rite":112,"Dereliction":113,
  "Furious":114,"Mail of Hellfire":115,"Coalescence":116,"Bloodlust":117,
  "Defiance":118,"Sneak Attack":119,"Adrenaline Rush":120,"Embolden":121,
  "Redirection":122,"Spiribird's Call":123,"Charge Master":124,"Foray":125,
  "Tune-Up":126,"Grinder (S)":127,"Bladescale Hone":128,
  "Wall Runner (Boost)":129,"Element Exploit":130,"Burst":131,"Guts":132,
  "Quick Breath":133,"Status Trigger":134,"Intrepid Heart":135,
  "Buildup Boost":136,"Berserk":137,"Wind Mantle":138,"Powder Mantle":139,
  "Frostcraft":140,"Dragon Conversion":141,"Heaven-Sent":142,
  "Frenzied Bloodlust":143,"Blood Awakening":144,"Strife":145,
  "Shock Absorber":146,"Inspiration":147
};

// invert to ID → name
const idToName = {};
for (let name in dictSkill) {
  idToName[ dictSkill[name] ] = name;
}

// grab DOM elements
const fileInput   = document.getElementById("fileInput");
const rarityInput = document.getElementById("rarityInput");
const btn         = document.getElementById("convertBtn");
const log         = document.getElementById("log");

// enable the button once a file is chosen
fileInput.addEventListener("change", () => {
  btn.disabled    = !fileInput.files.length;
  log.textContent = "";
});

btn.addEventListener("click", async () => {
  const text   = await fileInput.files[0].text();
  const rarity = +rarityInput.value;
  let output, fileName;

  // ─── Try JSON → TXT ───────────────────────────────────────────────────────
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw 0;
    // check for numeric Skills array
    if (!Array.isArray(data[0].Skills) ||
        typeof data[0].Skills[0] !== "number") throw 0;

    // build text lines
    output = data.map(obj => {
      const [id1, id2]    = obj.Skills;
      const [lv1, lv2]    = obj.SkillLevels;
      const [s1, s2, s3]  = obj.Slots;

      // blank if idToName[id] is undefined or empty
      const name1 = idToName[id1] || "";
      const name2 = idToName[id2] || "";

      return [ name1, lv1, name2, lv2, s1, s2, s3 ].join(",");
    }).join("\n");

    fileName = "skills.txt";
    log.textContent = `✅ JSON → TXT: ${output.split("\n").length} lines`;
  }
  catch {
    // ─── Fallback TXT → JSON ────────────────────────────────────────────────
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    const arr   = [];

    for (let ln of lines) {
      const cols = ln.split(",").map(c => c.trim());
      if (cols.length !== 7) {
        log.textContent += `⚠ Skipping invalid line: "${ln}"\n`;
        continue;
      }
      const [n1,l1,n2,l2,s1,s2,s3] = cols;

      // blank or missing name → 0
      const id1 = dictSkill[n1] ?? 0;
      const id2 = dictSkill[n2] ?? 0;

      arr.push({
        Rarity:      rarity,
        SkillLevels:[+l1, +l2],
        Skills:      [id1, id2],
        Slots:       [+s1, +s2, +s3]
      });
    }

    output   = JSON.stringify(arr, null, 2);
    fileName = "skills";  // no extension
    log.textContent = `✅ TXT → JSON: ${arr.length} entries`;
  }

  // ─── Trigger download ────────────────────────────────────────────────────
  const mime = (fileName === "skills")
    ? "application/octet-stream"
    : "text/plain";
  
  const blob = new Blob([output], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href       = url;
  a.download   = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
