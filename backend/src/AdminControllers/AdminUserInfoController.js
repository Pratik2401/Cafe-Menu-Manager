const UserInfo = require('../models/UserInfoModel');
const Settings = require('../models/Settings');

const AdminUserInfoController = {
  getUserInfoList: async (req, res) => {
    try {
      const userInfoList = await UserInfo.find().sort({ createdAt: -1 });
      res.json(userInfoList);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user info list', error: error.message });
    }
  },

  getUserInfoSettings: async (req, res) => {
    try {
      let settings = await Settings.findOne({ key: 'userInfoEnabled' });
      if (!settings) {
        settings = await Settings.create({ key: 'userInfoEnabled', value: true });
      }
      res.json({ enabled: settings.value });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
  },

  updateUserInfoSettings: async (req, res) => {
    try {
      const { enabled } = req.body;
      let settings = await Settings.findOne({ key: 'userInfoEnabled' });
      if (!settings) {
        settings = await Settings.create({ key: 'userInfoEnabled', value: enabled });
      } else {
        settings.value = enabled;
        await settings.save();
      }
      res.json({ enabled: settings.value });
    } catch (error) {
      res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
  }
};

module.exports = AdminUserInfoController;