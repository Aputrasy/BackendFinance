const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
//const authMiddleware = require('../middleware/auth');

// All routes require authentication
//router.use(authMiddleware);

// Master CRUD routes
router.get('/', masterController.getAll);
router.get('/stats', masterController.getDashboardStats);
router.get('/:id', masterController.getById);
router.post('/', masterController.create);
router.put('/:id', masterController.update);
router.delete('/:id', masterController.delete);
router.get('/:id/pdf', masterController.exportPDF);

module.exports = router;
