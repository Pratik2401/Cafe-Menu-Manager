const DailyOffer = require('../models/DailyOfferModel.js');

/**
 * Get all active daily offers
 */
const getActiveDailyOffers = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Find offers that are active and within date range
    const dailyOffers = await DailyOffer.find({
      isActive: true,
      startDate: { $lte: tomorrow },
      endDate: { $gte: today }
    }).populate({
      path: 'offers.items.item',
      select: 'name price image'
    });
    
    // Filter by time
    const timeFilteredOffers = dailyOffers.filter(offer => {
      const [startHour, startMin] = offer.startTime.split(':').map(Number);
      const [endHour, endMin] = offer.endTime.split(':').map(Number);
      const startTimeInMinutes = startHour * 60 + startMin;
      const endTimeInMinutes = endHour * 60 + endMin;
      
      let isTimeMatch;
      
      if (endTimeInMinutes < startTimeInMinutes) {
        // Time range crosses midnight (e.g., 23:00 to 01:00)
        isTimeMatch = currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes;
      } else {
        // Normal time range within same day
        isTimeMatch = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
      }
      
      // Debug logging
      console.log(`Offer ${offer._id}: ${offer.startTime}-${offer.endTime}, Current: ${currentHour}:${currentMinute}, Match: ${isTimeMatch}`);
      
      return isTimeMatch;
    });
    
    console.log(`Found ${dailyOffers.length} active offers, ${timeFilteredOffers.length} time-filtered offers`);
    
    res.status(200).json({
      success: true,
      data: timeFilteredOffers
    });
  } catch (error) {
    console.error('Error fetching active daily offers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily offers',
      error: error.message
    });
  }
};

/**
 * Get daily offer by ID
 */
const getDailyOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dailyOffer = await DailyOffer.findById(id).populate({
      path: 'offers.items.item',
      select: 'name price image description'
    });
    
    if (!dailyOffer) {
      res.status(404).json({
        success: false,
        message: 'Daily offer not found'
      });
      return;
    }
    
    // Check if the offer is active and current
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Format: HH:MM
    
    const isActive = dailyOffer.isActive && 
                    dailyOffer.startDate <= now && 
                    dailyOffer.endDate >= now &&
                    dailyOffer.startTime <= currentTime && 
                    dailyOffer.endTime >= currentTime;
    
    res.status(200).json({
      success: true,
      data: {
        ...dailyOffer.toObject(),
        isCurrentlyActive: isActive
      }
    });
  } catch (error) {
    console.error('Error fetching daily offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily offer',
      error: error.message
    });
  }
};

module.exports = {
  getActiveDailyOffers,
  getDailyOfferById
};