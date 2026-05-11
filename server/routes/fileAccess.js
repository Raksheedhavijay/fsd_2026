const router = require('express').Router();
const { serveAccessPage, verifyPassword, getFileInfo } = require('../controllers/fileAccessController');
router.get('/:token', serveAccessPage);
router.get('/:token/info', getFileInfo);
router.post('/:token/verify', verifyPassword);
module.exports = router;
