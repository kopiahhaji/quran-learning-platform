const express = require('express');
const router = express.Router();

// Debug test route
router.get('/debug-test', (req, res) => {
    res.render('debug-test');
});

module.exports = router;
