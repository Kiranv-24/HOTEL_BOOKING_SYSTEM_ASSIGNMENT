const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  checkAvailability
} = require('../controllers/bookingController');

// @route   GET /api/bookings
// @desc    Get all bookings (admin) or user's bookings (user)
// @access  Private
router.get('/', protect, getAllBookings);

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, getBookingById);

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', [
  protect,
  body('room')
    .notEmpty().withMessage('Room is required')
    .isMongoId().withMessage('Invalid room ID'),
  body('checkIn')
    .notEmpty().withMessage('Check-in date is required')
    .isISO8601().withMessage('Invalid check-in date format'),
  body('checkOut')
    .notEmpty().withMessage('Check-out date is required')
    .isISO8601().withMessage('Invalid check-out date format'),
  body('guests')
    .notEmpty().withMessage('Number of guests is required')
    .isInt({ min: 1, max: 10 }).withMessage('Guests must be between 1 and 10')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}, createBooking);

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', [
  protect,
  body('checkIn')
    .optional()
    .isISO8601().withMessage('Invalid check-in date format'),
  body('checkOut')
    .optional()
    .isISO8601().withMessage('Invalid check-out date format'),
  body('guests')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Guests must be between 1 and 10'),
  body('status')
    .optional()
    .isIn(['confirmed', 'cancelled', 'completed', 'pending']).withMessage('Invalid status')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}, updateBooking);

// @route   DELETE /api/bookings/:id
// @desc    Cancel/delete booking
// @access  Private
router.delete('/:id', protect, cancelBooking);

// @route   GET /api/bookings/room/:roomId/availability
// @desc    Check room availability for dates
// @access  Public
router.get('/room/:roomId/availability', checkAvailability);

module.exports = router;
