const express = require('express');
const router = express.Router();

router.get('/collection', (req, res) => {
    // Mock data for demonstration - in a real app, this would come from a database
    const collections = {
        bookmarks: [
            { surah: 'Al-Fatiha', verse: 1, note: 'Daily recitation', dateAdded: '2025-05-17' },
            { surah: 'Al-Baqarah', verse: 255, note: 'Ayatul Kursi', dateAdded: '2025-05-16' },
            { surah: 'Yasin', verse: 1, note: 'Morning routine', dateAdded: '2025-05-15' }
        ],
        recentActivity: [
            { type: 'Read', surah: 'An-Nas', timestamp: '2 hours ago', progress: '100%' },
            { type: 'Bookmarked', surah: 'Al-Falaq', timestamp: '1 day ago', verseNumber: 3 },
            { type: 'Study Session', surah: 'Al-Ikhlas', timestamp: '2 days ago', duration: '30 mins' }
        ],
        studyNotes: [
            { 
                title: 'Tajweed Rules Review',
                content: 'Notes on Noon Sakinah rules and their applications',
                tags: ['tajweed', 'rules'],
                lastModified: '2025-05-17'
            },
            {
                title: 'Memorization Progress',
                content: 'Completed memorization of Surah Al-Mulk with proper tajweed',
                tags: ['memorization', 'achievement'],
                lastModified: '2025-05-16'
            }
        ]
    };

    res.render('collection', {
        title: 'My Collection | Quran Learning Platform',
        collections,
        user: {
            name: 'Guest User',
            streak: 7,
            totalBookmarks: collections.bookmarks.length,
            totalNotes: collections.studyNotes.length
        }
    });
});

module.exports = router;