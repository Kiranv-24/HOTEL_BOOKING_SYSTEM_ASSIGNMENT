const Room = require('../models/Room');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getAllRooms = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, available } = req.query;

    // Build query
    let query = {};

    if (type) {
      query.type = type;
    }

    if (available === 'true') {
      query.isAvailable = true;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      // Fix: Ensure minPrice is not negative
      if (minPrice) {
        const min = parseFloat(minPrice);
        query.price.$gte = min < 0 ? 0 : min;
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        query.price.$lte = max < 0 ? 0 : max;
      }
    }

    const rooms = await Room.find(query).sort({ roomNumber: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: { rooms }
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { room }
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private (Admin only)
exports.createRoom = async (req, res) => {
  try {
    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber: req.body.roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room with this number already exists'
      });
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => file.path);
    }

    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Admin only)
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room number is being changed and if it already exists
    if (req.body.roomNumber && req.body.roomNumber !== room.roomNumber) {
      const existingRoom = await Room.findOne({ roomNumber: req.body.roomNumber });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: 'Room with this number already exists'
        });
      }
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary if they exist
      if (room.images && room.images.length > 0) {
        for (const imageUrl of room.images) {
          try {
            const publicId = imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`hotel-booking/rooms/${publicId}`);
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        }
      }
      req.body.images = req.files.map(file => file.path);
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: { room }
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message
    });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin only)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Delete images from Cloudinary if they exist
    if (room.images && room.images.length > 0) {
      for (const imageUrl of room.images) {
        try {
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`hotel-booking/rooms/${publicId}`);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
};
