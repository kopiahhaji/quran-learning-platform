const express = require('express');
const router = express.Router();

// Tajwid main page route
router.get('/tajwid', (req, res) => {
    res.render('tajwid', { 
        title: 'Learn Tajwid Rules',
        user: req.user // Will be undefined for now, can be used later for user tracking
    });
});

// API route for saving progress
router.post('/tajwid/progress', (req, res) => {
    // This will be implemented later with proper user tracking
    res.json({ status: 'success', message: 'Progress saved' });
});

// API route for fetching verse details
router.get('/tajwid/verse/:surahId/:verseId', (req, res) => {
    // This will be implemented later with actual verse data
    res.json({
        status: 'success',
        data: {
            arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
            tajweedRules: ['ghunnah', 'idgham', 'qalqalah']
        }
    });
});

module.exports = router;
