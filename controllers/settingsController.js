import mongoose from 'mongoose';

// Get user settings by user_id
const getUserSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting settings for userId:', userId);
    console.log('Database connection state:', mongoose.connection.readyState);
    
    const settings = await mongoose.connection.db
      .collection("settings")
      .findOne({ user_id: userId }, { projection: { _id: 0 } });
    
    console.log('Settings found:', settings);
    
    if (settings) {
      res.json({
        success: true,
        settings: settings
      });
    } else {
      res.json({
        success: true,
        message: "No settings found, returning default",
        settings: {
          user_id: userId,
          theme: "light",
          language: "en",
          notifications: true,
          currency: "INR"
        }
      });
    }
  } catch (error) {
    console.error('Settings API Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update user settings
const updateUserSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const updatedSetting = await mongoose.connection.db
      .collection("settings")
      .findOneAndUpdate(
        { user_id: userId },
        { $set: { ...req.body, updatedAt: new Date() } },
        { returnDocument: "after", projection: { _id: 0 } }
      );

    if (updatedSetting.value) {
      res.json({
        success: true,
        message: "Settings updated successfully",
        settings: updatedSetting.value
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: "Settings not found for this user" 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export { getUserSettings, updateUserSettings };