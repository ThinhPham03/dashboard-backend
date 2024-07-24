const router = require('express').Router();
const accountController = require('../controllers/accountController');
const { authenticateJWT } = require('../middleware/jsonwebtoken');

router.get('/', authenticateJWT, accountController.getList);
router.post('/login', accountController.authenticateLogin);
router.post('/logout', authenticateJWT, accountController.logout);
router.post('/authenticate', authenticateJWT, accountController.authenticateToken);
router.get('/page', authenticateJWT, accountController.getPages);
router.post('/change-password', authenticateJWT, accountController.changePassword);
router.post('/create', authenticateJWT, accountController.create);


router.get('/setting/', authenticateJWT, accountController.getSettings);
router.get('/setting/:settingId/select', authenticateJWT, accountController.selectSetting);
router.get('/setting/:settingId/delete', authenticateJWT, accountController.deleteSetting);
router.post('/setting/:settingId/share', authenticateJWT, accountController.shareSetting);
router.post('/setting/save', authenticateJWT, accountController.saveSettings);
router.get('/setting/get', authenticateJWT, accountController.getSettingSelection);
router.post('/setting/create', authenticateJWT, accountController.createSetting);

router.get('/:resetAccountId/reset', authenticateJWT, accountController.resetPassword);
router.get('/:targetAccountId/on', authenticateJWT, accountController.enableAccount);
router.get('/:targetAccountId/off', authenticateJWT, accountController.disableAccount);
router.get('/:targetAccountId/off', authenticateJWT, accountController.disableAccount);
router.get('/:accountId', authenticateJWT, accountController.checkPositionId);

module.exports = router;