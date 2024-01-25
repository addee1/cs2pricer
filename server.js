// Importera nödvändiga moduler
const express = require('express');
const axios = require('axios');

// Skapa en Express-app
const app = express();

// Definiera en rutt för att hämta Steam-inventariet
app.get('/inventory', async (req, res) => {
  try {
    // Hämta Steam ID och API-nyckel från query-parametrarna
    const steamId = req.query.steamId;
    const apiKey = req.query.apiKey;
    const appId = 730; // CS:GO
    const contextId = 2;

    // Kontrollera att både Steam ID och API-nyckel är angivna
    if (!steamId || !apiKey) {
        return res.status(400).send('Steam ID and API-key requied');
    }

    // Bygg URL för Steam API-förfrågan
    const url = `https://api.steampowered.com/IEconService/GetInventoryItemsWithDescriptions/v1/?key=${apiKey}&steamid=${steamId}&appid=${appId}&contextid=${contextId}&get_descriptions=true`;

    // Skicka förfrågan och få svar
    const response = await axios.get(url);

    // Skicka tillbaka inventarieinformationen som JSON
    res.json(response.data);
  } catch (error) {
    // Hantera eventuella fel
    res.status(500).send('Error fetching inventory');
  }
});

app.use(express.static('public'));

// Starta servern på port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
