const Tag = require('../models/TagModel');

const getAllTags = async (_req, res) => {
  try {
    // Only return active tags
    const tags = await Tag.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tags', details: err.message });
  }
};

const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findOne({ 
      _id: req.params.id,
      isActive: true 
    });
    
    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    
    res.json(tag);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tag', details: err.message });
  }
};

module.exports = {
  getAllTags,
  getTagById
};