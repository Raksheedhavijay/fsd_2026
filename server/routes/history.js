const router = require('express').Router();
const auth = require('../middleware/auth');
const { getHistory } = require('../controllers/historyController');
router.get('/', auth, getHistory);
module.exports = router;
