const router = require('express').Router();
const salesController = require('../controllers/salesController');
const { authenticateJWT } = require('../middleware/jsonwebtoken');

router.get('/page', authenticateJWT, salesController.getPages);
router.get('/report/export', authenticateJWT, salesController.getExportData);
router.get('/report', authenticateJWT, salesController.getReport);

module.exports = router;