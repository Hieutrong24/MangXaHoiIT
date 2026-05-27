const express = require('express');
const controller = require('./preference.controller');

const router = express.Router();

router.get('/', controller.getPreferences);
router.put('/', controller.updatePreferences);

module.exports = router;
