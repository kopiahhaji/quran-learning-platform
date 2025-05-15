// Basic Express server setup
const express = require('express');
const path = require('path');
const { networkInterfaces } = require('os');
const app = express();
const port = process.env.PORT || 3000;

// Set up static files directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up template engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Quran Learning Platform' });
});

// Helper function to find your local IP address
function getLocalIp() {
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '0.0.0.0'; // Fallback
}

// Start server - Modified to accept connections from other devices
app.listen(port, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`Server running on http://localhost:${port}`);
  console.log(`For external access (from your Pixel): http://${localIp}:${port}`);
});