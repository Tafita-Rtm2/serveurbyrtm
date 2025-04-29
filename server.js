const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());

const DB_FILE = "codes.json";

// Charger les codes depuis fichier
let codes = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE)) : {
  "1206": null,
  "1212": null,
  "1215": null,
  "8281": null,
  "1217": null,
  "1995": null
};

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(codes, null, 2));
}

// API : Valider un code
app.post("/validate", (req, res) => {
  const { code, deviceId } = req.body;
  const now = Date.now();

  if (!codes.hasOwnProperty(code)) return res.status(400).json({ success: false, message: "Code invalide." });

  const record = codes[code];
  if (!record) {
    // Nouveau code valide
    codes[code] = { deviceId, timestamp: now };
    saveDB();
    return res.json({ success: true });
  }

  if (record.deviceId === deviceId) {
    // Même appareil, vérifier expiration
    if (now - record.timestamp < 30 * 24 * 60 * 60 * 1000) {
      return res.json({ success: true });
    } else {
      return res.status(403).json({ success: false, message: "Code expiré." });
    }
  }

  return res.status(403).json({ success: false, message: "Ce code est déjà utilisé sur un autre appareil." });
});

app.listen(PORT, () => console.log(`Serveur en ligne sur http://localhost:${PORT}`));
