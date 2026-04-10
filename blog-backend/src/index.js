require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const initDB = require('./config/initDB');

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api', routes);

// Route de test
app.get('/', (req, res) => res.json({ message: '🚀 Blog API fonctionne !' }));

// Démarrage
app.listen(PORT, async () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  await initDB();
});
