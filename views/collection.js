const express = require('express');
const router = express.Router();

// Collection page route
router.get('/collection', (req, res, next) => {
    try {
        res.render('collection', { 
            title: 'Collection | Quran Learning Platform'
        });
    } catch (error) {
        console.error('Error rendering collection page:', error);
        next(error);
    }
});

module.exports = router;
