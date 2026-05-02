const express = require('express');
const router = express.Router();
const detailController = require('../controllers/detailController');
//const authMiddleware = require('../middleware/auth');

// All routes require authentication
//router.use(authMiddleware);

// Get details by master (query param style for frontend compatibility)
router.get('/', detailController.getByMasterQuery);

// Detail CRUD routes (RESTful style)
router.post('/', detailController.create);
router.get('/:id', detailController.getById);
router.put('/:id', detailController.update);
router.delete('/:id', detailController.delete);

// Legacy routes for backward compatibility
router.get('/master/:masterId', detailController.getByMaster);
router.post('/master/:masterId', detailController.createWithMaster);
router.put('/master/:masterId/:id', detailController.updateWithMaster);
router.delete('/master/:masterId/:id', detailController.deleteWithMaster);

module.exports = router;
