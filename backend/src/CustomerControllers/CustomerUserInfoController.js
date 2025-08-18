const UserInfo = require('../models/UserInfoModel');

const CustomerUserInfoController = {
  // Create new user info
  createUserInfo: async (req, res) => {
    try {
      const userInfo = new UserInfo(req.body);
      await userInfo.save();
      res.status(201).json(userInfo);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get user info by email
  getUserInfoByEmail: async (req, res) => {
    try {
      const userInfo = await UserInfo.findOne({ email: req.params.email });
      if (!userInfo) {
        return res.status(404).json({ message: 'User info not found' });
      }
      res.json(userInfo);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = CustomerUserInfoController;