const router = require('express').Router();
const auth = require('../middleware/auth');
const File = require('../models/File');
router.get('/:token', auth, async (req, res) => {
  try {
    const file = await File.findOne({ token: req.params.token, owner: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json({ qrCode: file.qrCode, token: file.token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
