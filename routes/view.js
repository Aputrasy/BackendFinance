const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');

// Public view routes - NO authentication required
// GET /api/view/masters/:id
router.get('/masters/:id', viewController.getMasterById);

// GET /api/view/details?masterId=
router.get('/details', viewController.getDetailsByMaster);

module.exports = router;
