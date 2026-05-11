const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile, getUserFiles, deleteFile } = require('../controllers/uploadController');
router.post('/', auth, upload.single('file'), uploadFile);
router.get('/my-files', auth, getUserFiles);
router.delete('/:id', auth, deleteFile);
module.exports = router;
