const Social = require('../models/SocialModel.js');

/**
 * Get all visible social entries
 */
const getAllSocials = async (req, res) => {
  try {
    const socials = await Social.find({ isVisible: true }).sort({ serialId: 1 });
    res.status(200).json(socials);
  } catch (error) {
    console.error('Error fetching socials:', error);
    res.status(500).json({ message: 'Server error while fetching socials' });
  }
};

module.exports = {
  getAllSocials
};