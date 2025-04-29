const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "codes.json");

app.use(cors());
app.use(express.json());

// Crée un fichier codes.json si inexistant
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    "1206": null,
    "1212": null,
    "1215": null,
    "8281": null,
    "1217": null,
    "1995": null
  }, null, 2));
}

let codes = JSON.parse(fs.readFileSync(DB_FILE));

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(codes, null, 2));
}

app.post("/validate", (req, res) => {
  const { code, deviceId } = req.body;
  const now = Date.now();

  if (!codes.hasOwnProperty(code)) {
    return res.status(400).json({ success: false, message: "Code invalide." });
  }

  const record = codes[code];

  // Si code jamais utilisé
  if (!record) {
    codes[code] = { deviceId, timestamp: now };
    saveDB();
    return res.json({ success: true });
  }

  // Si code déjà utilisé sur le même appareil
  if (record.deviceId === deviceId) {
    if (now - record.timestamp < 30 * 24 * 60 * 60 * 1000) {
      return res.json({ success: true });
    } else {
      return res.status(403).json({ success: false, message: "Code expiré." });
    }
  }

  // Code déjà utilisé ailleurs
  return res.status(403).json({ success: false, message: "Code déjà utilisé sur un autre appareil." });
});

app.get("/", (req, res) => {
  res.send("API de validation active.");
});

app.listen(PORT, () => {
  console.log(`Serveur actif sur le port ${PORT}`);
});
