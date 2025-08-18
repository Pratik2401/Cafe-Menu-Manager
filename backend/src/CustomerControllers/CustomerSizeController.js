const Size = require('../models/SizeModel.js');

// Get all sizes
const getAllSizes = async (req, res) => {
  try {
    const sizes = await Size.find();
    res.status(200).json(sizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get size by ID
const getSizeById = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    if (!size) {
      res.status(404).json({ message: 'Size not found' });
      return;
    }
    res.status(200).json(size);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getAllSizes,
  getSizeById
};