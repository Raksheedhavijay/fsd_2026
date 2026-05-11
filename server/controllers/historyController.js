const AccessLog = require('../models/AccessLog');
const File = require('../models/File');

exports.getHistory = async (req, res) => {
  try {
    const files = await File.find({ owner: req.user.id }).select('_id');
    const ids = files.map(f => f._id);
    const logs = await AccessLog.find({ fileId: { $in: ids } })
      .populate('fileId', 'originalName token')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
