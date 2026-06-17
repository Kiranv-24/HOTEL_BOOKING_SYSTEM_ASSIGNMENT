const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Helper function to check for overlapping bookings
const checkOverlap = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  const query = {
    room: roomId,
    status: { $in: ['confirmed', 'pending'] },
    $or: [
      // New booking starts during an existing booking
      {
        checkIn: { $lte: checkIn },
        checkOut: { $gt: checkIn }
      },
      // New booking ends during an existing booking
      {
        checkIn: { $lt: checkOut },
        checkOut: { $gte: checkOut }
      },
      // New booking completely contains an existing booking
      {
        checkIn: { $gte: checkIn },
        checkOut: { $lte: checkOut }
      },
      // Existing booking completely contains the new booking
      {
        checkIn: { $lte: checkIn },
        checkOut: { $gte: checkOut }
      }
    ]
  };

  // Exclude current booking when updating
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlappingBooking = await Booking.findOne(query);
  return overlappingBooking;
};

// @desc    Get all bookings (admin) or user's bookings (user)
// @route   GET /api/bookings
// @access  Private
exports.getAllBookings = async (req, res) => {
  try {
    let bookings;

    if (req.user.role === 'admin') {
      // Admin can see all bookings
      bookings = await Booking.find()
        .populate('user', 'name email')
        .populate('room', 'roomNumber type price')
        .sort({ createdAt: -1 });
    } else {
      // Regular users can only see their own bookings
      bookings = await Booking.find({ user: req.user.id })
        .populate('room', 'roomNumber type price')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: { bookings }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('room', 'roomNumber type price capacity amenities');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { room, checkIn, checkOut, guests, specialRequests } = req.body;

    // Parse dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate check-out is after check-in
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Check if room exists
    const roomData = await Room.findById(room);
    if (!roomData) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room is available
    if (!roomData.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for booking'
      });
    }

    // Check if guests don't exceed room capacity
    if (guests > roomData.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room capacity is ${roomData.capacity}. Cannot accommodate ${guests} guests.`
      });
    }

    // Check for overlapping bookings (double booking prevention)
    const overlappingBooking = await checkOverlap(room, checkInDate, checkOutDate);
    if (overlappingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Room is already booked for the selected dates. Please choose different dates.',
        conflictingBooking: {
          checkIn: overlappingBooking.checkIn,
          checkOut: overlappingBooking.checkOut
        }
      });
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * roomData.price;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      room,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      specialRequests
    });

    // Populate booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('room', 'roomNumber type price');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: populatedBooking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to update this booking
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // If updating dates, check for overlaps
    if (req.body.checkIn || req.body.checkOut) {
      const checkInDate = req.body.checkIn ? new Date(req.body.checkIn) : booking.checkIn;
      const checkOutDate = req.body.checkOut ? new Date(req.body.checkOut) : booking.checkOut;

      // Validate check-out is after check-in
      if (checkOutDate <= checkInDate) {
        return res.status(400).json({
          success: false,
          message: 'Check-out date must be after check-in date'
        });
      }

      // Check for overlapping bookings
      const overlappingBooking = await checkOverlap(
        booking.room,
        checkInDate,
        checkOutDate,
        booking._id
      );

      if (overlappingBooking) {
        return res.status(409).json({
          success: false,
          message: 'Room is already booked for the selected dates. Please choose different dates.',
          conflictingBooking: {
            checkIn: overlappingBooking.checkIn,
            checkOut: overlappingBooking.checkOut
          }
        });
      }

      // Recalculate price if dates changed
      if (req.body.checkIn || req.body.checkOut) {
        const room = await Room.findById(booking.room);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        req.body.totalPrice = nights * room.price;
      }
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('room', 'roomNumber type price');

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
};

// @desc    Cancel/delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to cancel this booking
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Instead of deleting, mark as cancelled
    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

// @desc    Check room availability for dates
// @route   GET /api/bookings/room/:roomId/availability
// @access  Public
exports.checkAvailability = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check for overlapping bookings
    const overlappingBooking = await checkOverlap(roomId, checkInDate, checkOutDate);

    res.status(200).json({
      success: true,
      data: {
        available: !overlappingBooking,
        room: {
          id: room._id,
          roomNumber: room.roomNumber,
          type: room.type,
          price: room.price
        },
        dates: {
          checkIn: checkInDate,
          checkOut: checkOutDate
        }
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: error.message
    });
  }
};
