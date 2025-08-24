const Cafe = require('../models/CafeModel.js');

/**
 * Get the cafe details.
 */
const getCafe = async (_req, res) => {
  try {
    let cafe = await Cafe.findOne();
    
    // Create default cafe if none exists
    if (!cafe) {
      cafe = await Cafe.create({
        name: 'Snap2Eat Cafe',
        location: 'Default Location',
        gstIncluded: false,
        cgst: 0,
        sgst: 0,
        allowOrdering: true,
        radius: 0,
        imageUrl: '',
        backgroundImageUrl: '',
        menuCustomization: {
          cssVariables: {
            '--bg-primary': '#FEF8F3',
            '--bg-secondary': '#FEAD2E',
            '--bg-tertiary': '#383838',
            '--color-dark': '#383838',
            '--color-accent': '#FEAD2E',
            '--color-secondary': '#666666',
            '--card-bg': '#FFFFFF',
            '--card-text': '#000000'
          },
          logoUrl: '',
          logoBackgroundColor: '#FFFFFF',
          backgroundImage: ''
        }
      });
    }
    
    res.status(200).json(cafe);
  } catch (error) {
    console.error('Error fetching cafe:', error.message);
    res.status(500).json({ error: 'Failed to fetch cafe', details: error.message });
  }
};

/**
 * Get cafe settings for customer-facing pages
 */
const getCafeSettings = async (_req, res) => {
  try {
    let cafe = await Cafe.findOne();
    
    // Create default cafe if none exists
    if (!cafe) {
      cafe = await Cafe.create({
        name: 'Snap2Eat Cafe',
        location: 'Default Location',
        gstIncluded: false,
        cgst: 0,
        sgst: 0,
        allowOrdering: true,
        radius: 0,
        imageUrl: '',
        backgroundImageUrl: '',
        menuCustomization: {
          cssVariables: {
            '--bg-primary': '#FEF8F3',
            '--bg-secondary': '#FEAD2E',
            '--bg-tertiary': '#383838',
            '--color-dark': '#383838',
            '--color-accent': '#FEAD2E',
            '--color-secondary': '#666666',
            '--card-bg': '#FFFFFF',
            '--card-text': '#000000'
          },
          logoUrl: '',
          logoBackgroundColor: '#FFFFFF',
          backgroundImage: ''
        }
      });
    }
    
    console.log('Customer getCafeSettings - cafe.features:', cafe.features);
    console.log('Customer getCafeSettings - full cafe:', JSON.stringify(cafe, null, 2));
    
    res.status(200).json({
      success: true,
      data: {
        name: cafe.name,
        location: cafe.location,
        imageUrl: cafe.imageUrl,
        backgroundImageUrl: cafe.backgroundImageUrl,
        allowOrdering: cafe.allowOrdering,
        menuCustomization: cafe.menuCustomization,
        features: cafe.features || { eventsToggle: true, dailyOfferToggle: true, ordersToggle: false }
      }
    });
  } catch (error) {
    console.error('Error fetching cafe settings:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch cafe settings', 
      error: error.message 
    });
  }
};

/**
 * Update card colors (background, text, and secondary)
 */
const updateCardColors = async (req, res) => {
  try {
    const { cardBgColor, cardTextColor, cardSecondaryColor } = req.body;
    
    if (!cardBgColor && !cardTextColor && !cardSecondaryColor) {
      res.status(400).json({
        success: false,
        message: 'At least one color (cardBgColor, cardTextColor, or cardSecondaryColor) is required'
      });
      return;
    }
    
    let cafe = await Cafe.findOne();
    if (!cafe) {
      res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
      return;
    }
    
    // Prepare update data
    const updateData = {};
    
    if (cardBgColor) {
      updateData['menuCustomization.cssVariables.--card-bg'] = cardBgColor;
    }
    
    if (cardTextColor) {
      updateData['menuCustomization.cssVariables.--card-text'] = cardTextColor;
    }
    
    if (cardSecondaryColor) {
      updateData['menuCustomization.cssVariables.--color-secondary'] = cardSecondaryColor;
    }
    
    // Update the cafe
    const updatedCafe = await Cafe.findByIdAndUpdate(
      cafe._id,
      { $set: updateData },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Card colors updated successfully',
      data: {
        cardBgColor: updatedCafe?.menuCustomization?.cssVariables?.['--card-bg'],
        cardTextColor: updatedCafe?.menuCustomization?.cssVariables?.['--card-text'],
        cardSecondaryColor: updatedCafe?.menuCustomization?.cssVariables?.['--color-secondary'],
        menuCustomization: updatedCafe?.menuCustomization
      }
    });
  } catch (error) {
    console.error('Error updating card colors:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update card colors',
      error: error.message
    });
  }
};

module.exports = {
  getCafe,
  getCafeSettings,
  updateCardColors
};