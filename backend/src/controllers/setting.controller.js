const Setting = require('../models/Setting');

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

exports.upsertSetting = async (req, res, next) => {
  try {
    const { key, value, description } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value, description },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: setting });
  } catch (error) {
    next(error);
  }
};

exports.deleteSetting = async (req, res, next) => {
  try {
    const setting = await Setting.findByIdAndDelete(req.params.id);
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    res.status(200).json({ success: true, message: 'Setting deleted' });
  } catch (error) {
    next(error);
  }
};
