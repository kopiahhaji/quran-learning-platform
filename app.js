require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { networkInterfaces } = require('os');

const app = express();
const port = process.env.PORT || 3000;

// Basic security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      mediaSrc: ["'self'", "https://download.quranicaudio.com"],
      connectSrc: ["'self'", "https://download.quranicaudio.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Enable compression
app.use(compression());

// Enable CORS
app.use(cors());

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up static files directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const debugRoutes = require('./routes/debug');
const collectionRoutes = require('./routes/collection');
const tajwidRoutes = require('./routes/tajwid');

// Apply routes
app.use('/', debugRoutes);
app.use('/', collectionRoutes);
app.use('/', tajwidRoutes);

// Define main routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Quran Learning Platform',
    currentPage: 'home'
  });
});

// Quran Reading page
app.get('/quran', (req, res) => {
  const verses = [
    {
      arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "In the name of Allah, the Most Gracious, the Most Merciful.",
      audioUrl: "https://download.quranicaudio.com/verses/mishaari_raashid_al_3afaasee/001001.mp3"
    },
    {
      arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      translation: "All praise is due to Allah, Lord of the worlds.",
      audioUrl: "https://download.quranicaudio.com/verses/mishaari_raashid_al_3afaasee/001002.mp3"
    },
    {
      arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "The Most Gracious, the Most Merciful.",
      audioUrl: "https://download.quranicaudio.com/verses/mishaari_raashid_al_3afaasee/001003.mp3"
    },
    {
      arabic: "مَالِكِ يَوْمِ الدِّينِ",
      translation: "Master of the Day of Judgment.",
      audioUrl: "https://download.quranicaudio.com/verses/mishaari_raashid_al_3afaasee/001004.mp3"
    },
    {
      arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      translation: "You alone we worship, and You alone we ask for help.",
      audioUrl: "https://download.quranicaudio.com/verses/mishaari_raashid_al_3afaasee/001005.mp3"
    },
    {
      arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      translation: "Guide us on the Straight Path.",
      audioUrl: "https://download.quranicaudio.com/verses/mishaari_raashid_al_3afaasee/001006.mp3"
    },
    {
      arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
      translation: "The path of those who have received Your grace; not the path of those who have brought down wrath upon themselves, nor of those who have gone astray.",
      audioUrl: "https://download.quranicaudio.com/verses/mishaari_raashid_al_3afaasee/001007.mp3"
    }
  ];
  res.render('quran', { title: 'Quran Reading', verses });
});

// Tajwid Rules page (placeholder)
app.get('/tajwid', (req, res) => {
  res.render('tajwid', { title: 'Tajwid Rules' });
});

// Practice Tests page (placeholder)
app.get('/tests', (req, res) => {
  res.render('tests', { title: 'Practice Tests' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
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