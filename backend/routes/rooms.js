const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Public
router.get('/', getAllRooms);

// @route   GET /api/rooms/:id
// @desc    Get single room
// @access  Public
router.get('/:id', getRoomById);

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Private (Admin only)
router.post('/', [
  protect,
  authorize('admin'),
  upload.array('images', 5),
  body('roomNumber')
    .trim()
    .notEmpty().withMessage('Room number is required'),
  body('type')
    .trim()
    .notEmpty().withMessage('Room type is required')
    .isIn(['single', 'double', 'suite', 'deluxe', 'penthouse']).withMessage('Invalid room type'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price cannot be negative'),
  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1, max: 10 }).withMessage('Capacity must be between 1 and 10')
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
}, createRoom);

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private (Admin only)
router.put('/:id', [
  protect,
  authorize('admin'),
  upload.array('images', 5),
  body('roomNumber')
    .optional()
    .trim()
    .notEmpty().withMessage('Room number cannot be empty'),
  body('type')
    .optional()
    .trim()
    .notEmpty().withMessage('Room type cannot be empty')
    .isIn(['single', 'double', 'suite', 'deluxe', 'penthouse']).withMessage('Invalid room type'),
  body('price')
    .optional()
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price cannot be negative'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Capacity must be between 1 and 10')
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
}, updateRoom);

// @route   DELETE /api/rooms/:id
// @desc    Delete room
// @access  Private (Admin only)
router.delete('/:id', [protect, authorize('admin')], deleteRoom);

module.exports = router;
