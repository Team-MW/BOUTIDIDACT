const express = require('express');
const cors = require('cors');
const net = require('net');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Fonction pour vérifier si l'imprimante est joignable sur le port 9100
const checkPrinterStatus = (ip, port = 9100, timeout = 2000) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, ip);
  });
};

// Route pour l'impression
app.post('/api/print', async (req, res) => {
  try {
    const { printerIp, nomCommerce, items, total, paiement, ticketId } = req.body;

    if (!printerIp) {
      return res.status(400).json({ error: "L'adresse IP de l'imprimante est requise." });
    }

    // 1. Vérification du statut de l'imprimante
    const isOnline = await checkPrinterStatus(printerIp);
    if (!isOnline) {
      return res.status(503).json({ error: "L'imprimante est hors ligne ou injoignable sur le port 9100." });
    }

    // 2. Initialisation de l'imprimante
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,                             // ou STAR, selon l'imprimante
      interface: `tcp://${printerIp}`,
      characterSet: 'PC858_EURO',                           // Pour gérer les caractères accentués européens
      removeSpecialCharacters: false,
      options: {
        timeout: 5000
      }
    });

    // 3. Formatage et composition du ticket
    // Header centré (Nom du commerce)
    printer.alignCenter();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println(nomCommerce || "MON COMMERCE");
    printer.bold(false);
    printer.setTextSize(0, 0);
    printer.println("=========================================");
    printer.println(`Ticket N° : ${ticketId || Date.now()}`);
    printer.println(`Date : ${new Date().toLocaleString('fr-FR')}`);
    printer.println("-----------------------------------------");
    
    // Colonnes alignées pour les produits
    printer.alignLeft();
    items.forEach(item => {
      // Calcul du padding pour aligner les prix à droite
      // Largeur standard d'un ticket est d'environ 42 caractères (sur 80mm)
      const qty = `${item.quantity}x `;
      const name = item.name.substring(0, 20); // Tronquer les noms trop longs
      const price = `${Number(item.price).toFixed(2)} €`;
      const totalItem = `${(Number(item.price) * item.quantity).toFixed(2)} €`;

      printer.leftRight(`${qty}${name}`, totalItem);
    });

    printer.println("-----------------------------------------");
    
    // Total et mode de paiement
    printer.alignRight();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println(`TOTAL: ${Number(total).toFixed(2)} €`);
    printer.bold(false);
    printer.setTextSize(0, 0);
    printer.println(`Payé par : ${paiement || "Espèces"}`);

    printer.println("-----------------------------------------");

    // Footer avec mentions légales
    printer.alignCenter();
    printer.println("Merci de votre visite !");
    printer.println("À bientot.");

    // Coupure automatique du papier et ouverture du tiroir-caisse
    printer.cut();
    // printer.openCashDrawer(); // Décommentez pour ouvrir le tiroir-caisse

    // 4. Envoi de la commande à l'imprimante
    const execute = await printer.execute();
    
    if (execute) {
      return res.status(200).json({ success: true, message: "Impression réussie avec succès !" });
    } else {
      return res.status(500).json({ error: "L'envoi des données à l'imprimante a échoué." });
    }

  } catch (error) {
    console.error("Erreur d'impression:", error);
    return res.status(500).json({ error: "Erreur interne du serveur lors de l'impression.", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Print Server Express à l'écoute sur le port ${PORT}...`);
  console.log(`Prêt à recevoir les requêtes sur http://localhost:${PORT}/api/print`);
});
