import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomsAPI, bookingsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, IndianRupee, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookRoom = () => {
  const { roomId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    guests: 1,
    specialRequests: ''
  });
  
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, isAuthenticated, navigate]);

  useEffect(() => {
    if (room && formData.checkIn && formData.checkOut) {
      checkRoomAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.checkIn, formData.checkOut, room]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const response = await roomsAPI.getById(roomId);
      setRoom(response.data.data.room);
    } catch (err) {
      setError('Failed to load room details');
      console.error('Error fetching room:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkRoomAvailability = async () => {
    if (!room) return;
    
    try {
      setCheckingAvailability(true);
      const response = await bookingsAPI.checkAvailability(
        roomId,
        formData.checkIn.toISOString(),
        formData.checkOut.toISOString()
      );
      setAvailability(response.data.data.available);
    } catch (err) {
      console.error('Error checking availability:', err);
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!room) return 0;
    const nights = Math.ceil((formData.checkOut - formData.checkIn) / (1000 * 60 * 60 * 24));
    return nights * room.price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.checkOut <= formData.checkIn) {
      setError('Check-out date must be after check-in date');
      return;
    }

    if (formData.guests > room.capacity) {
      setError(`Room capacity is ${room.capacity}. Cannot accommodate ${formData.guests} guests.`);
      return;
    }

    if (availability === false) {
      setError('Room is not available for the selected dates');
      return;
    }

    setBookingLoading(true);

    try {
      const bookingData = {
        room: roomId,
        checkIn: formData.checkIn.toISOString(),
        checkOut: formData.checkOut.toISOString(),
        guests: formData.guests,
        specialRequests: formData.specialRequests
      };

      await bookingsAPI.create(bookingData);
      setSuccess('Booking created successfully!');
      
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
      console.error('Error creating booking:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const roomTypeLabels = {
    single: 'Single Room',
    double: 'Double Room',
    suite: 'Suite',
    deluxe: 'Deluxe Room',
    penthouse: 'Penthouse'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Room not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Go back to rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Rooms
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Room Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-48 bg-gray-200 rounded-lg mb-6 relative overflow-hidden">
              {room.images && room.images.length > 0 ? (
                <img
                  src={room.images[0]}
                  alt={`Room ${room.roomNumber}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-white opacity-80" />
                </div>
              )}
            </div>

            {room.images && room.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mb-6">
                {room.images.slice(1, 5).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Room ${room.roomNumber} - Image ${index + 2}`}
                    className="w-full h-20 object-cover rounded-md"
                  />
                ))}
              </div>
            )}

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Room {room.roomNumber}
            </h1>
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 mb-4">
              {roomTypeLabels[room.type]}
            </span>

            {room.description && (
              <p className="text-gray-600 mb-4">{room.description}</p>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-700">
                <IndianRupee className="h-5 w-5 mr-3 text-blue-600" />
                <span className="text-2xl font-bold">₹{room.price}</span>
                <span className="ml-2 text-gray-500">/ night</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Users className="h-5 w-5 mr-3 text-blue-600" />
                <span>Capacity: {room.capacity} guests</span>
              </div>
              {room.amenities && room.amenities.length > 0 && (
                <div className="flex items-start text-gray-700">
                  <span className="font-medium mr-3 text-blue-600">Amenities:</span>
                  <span>{room.amenities.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Book This Room</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700 text-sm">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date
                </label>
                <DatePicker
                  selected={formData.checkIn}
                  onChange={(date) => setFormData({ ...formData, checkIn: date })}
                  minDate={new Date()}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date
                </label>
                <DatePicker
                  selected={formData.checkOut}
                  onChange={(date) => setFormData({ ...formData, checkOut: date })}
                  minDate={new Date(formData.checkIn.getTime() + 24 * 60 * 60 * 1000)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests
                </label>
                <input
                  type="number"
                  min="1"
                  max={room.capacity}
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Max capacity: {room.capacity} guests</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows="3"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requests..."
                />
              </div>

              {/* Availability Check */}
              {checkingAvailability ? (
                <div className="text-center py-2">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600 mt-2">Checking availability...</p>
                </div>
              ) : availability !== null && (
                <div className={`p-3 rounded-md ${availability ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-sm ${availability ? 'text-green-700' : 'text-red-700'}`}>
                    {availability ? '✓ Room is available for these dates' : '✗ Room is not available for these dates'}
                  </p>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Price:</span>
                  <span className="text-2xl font-bold text-gray-900">₹{calculateTotalPrice()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.ceil((formData.checkOut - formData.checkIn) / (1000 * 60 * 60 * 24))} nights × ₹{room.price}/night
                </p>
              </div>

              <button
                type="submit"
                disabled={bookingLoading || availability === false}
                className="w-full py-3 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {bookingLoading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRoom;
