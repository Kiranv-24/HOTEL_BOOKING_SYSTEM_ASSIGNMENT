const mongoose = require('mongoose');
const Room = require('./models/Room');
const User = require('./models/User');
require('dotenv').config();

// Sample room data (Indian Rupee prices)
const sampleRooms = [
  {
    roomNumber: '101',
    type: 'single',
    price: 2500,
    capacity: 1,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom'],
    description: 'Comfortable single room perfect for solo travelers with all essential amenities.',
    isAvailable: true
  },
  {
    roomNumber: '102',
    type: 'single',
    price: 3000,
    capacity: 1,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge'],
    description: 'Cozy single room with extra amenities for a comfortable stay.',
    isAvailable: true
  },
  {
    roomNumber: '201',
    type: 'double',
    price: 4500,
    capacity: 2,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'Coffee Maker'],
    description: 'Spacious double room ideal for couples or friends traveling together.',
    isAvailable: true
  },
  {
    roomNumber: '202',
    type: 'double',
    price: 5000,
    capacity: 2,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'Coffee Maker', 'Balcony'],
    description: 'Elegant double room with a balcony offering city views.',
    isAvailable: true
  },
  {
    roomNumber: '301',
    type: 'suite',
    price: 8000,
    capacity: 3,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'Coffee Maker', 'Balcony', 'Living Area', 'Work Desk'],
    description: 'Luxurious suite with separate living area, perfect for business travelers.',
    isAvailable: true
  },
  {
    roomNumber: '302',
    type: 'suite',
    price: 10000,
    capacity: 3,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'Coffee Maker', 'Balcony', 'Living Area', 'Work Desk', 'Jacuzzi'],
    description: 'Premium suite with jacuzzi and stunning views for a relaxing stay.',
    isAvailable: true
  },
  {
    roomNumber: '401',
    type: 'deluxe',
    price: 12000,
    capacity: 4,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'Coffee Maker', 'Balcony', 'Living Area', 'Work Desk', 'Jacuzzi', 'King Bed'],
    description: 'Spacious deluxe room with king bed and premium amenities for families.',
    isAvailable: true
  },
  {
    roomNumber: '402',
    type: 'deluxe',
    price: 15000,
    capacity: 4,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'Coffee Maker', 'Balcony', 'Living Area', 'Work Desk', 'Jacuzzi', 'King Bed', 'Ocean View'],
    description: 'Ultimate deluxe room with ocean views and luxury amenities.',
    isAvailable: true
  },
  {
    roomNumber: '501',
    type: 'penthouse',
    price: 25000,
    capacity: 6,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'Coffee Maker', 'Balcony', 'Living Area', 'Work Desk', 'Jacuzzi', 'King Bed', 'Ocean View', 'Kitchen', 'Dining Area', 'Butler Service'],
    description: 'Exclusive penthouse with full kitchen, dining area, and butler service.',
    isAvailable: true
  },
  {
    roomNumber: '502',
    type: 'penthouse',
    price: 35000,
    capacity: 8,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'Coffee Maker', 'Balcony', 'Living Area', 'Work Desk', 'Jacuzzi', 'King Bed', 'Ocean View', 'Kitchen', 'Dining Area', 'Butler Service', 'Private Terrace', 'Home Theater'],
    description: 'Luxury penthouse with private terrace and home theater system.',
    isAvailable: true
  }
];

// Admin user data
const adminUser = {
  name: 'Admin User',
  email: 'admin@hotel.com',
  password: 'admin123',
  role: 'admin'
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-booking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Room.deleteMany({});
    await User.deleteMany({});
    console.log('Existing data cleared');

    // Create admin user
    console.log('Creating admin user...');
    const user = await User.create(adminUser);
    console.log('Admin user created:', { email: user.email, role: user.role });

    // Create sample rooms
    console.log('Creating sample rooms...');
    const rooms = await Room.insertMany(sampleRooms);
    console.log(`${rooms.length} rooms created successfully`);

    console.log('\n=== Database Seeded Successfully ===');
    console.log('\nAdmin Credentials:');
    console.log('Email: admin@hotel.com');
    console.log('Password: admin123');
    console.log('\nRooms created:');
    rooms.forEach(room => {
      console.log(`- Room ${room.roomNumber}: ${room.type} - ₹${room.price}/night`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

seedDatabase();
