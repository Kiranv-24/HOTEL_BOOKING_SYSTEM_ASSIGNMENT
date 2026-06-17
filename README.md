# Hotel Booking System

A full-stack hotel booking application with React, Node.js, Express, and MongoDB. Features include user authentication, room management, booking system with double booking prevention, and admin panel.

## Features

### User Features
- **User Registration & Login**: Secure authentication with JWT tokens
- **Room Browsing**: View available rooms with filtering options (type, price, availability)
- **Room Booking**: Book rooms with date selection and guest count
- **Double Booking Prevention**: Automatic overlap detection to prevent conflicting bookings
- **Booking History**: View and manage personal bookings
- **Booking Cancellation**: Cancel confirmed bookings

### Admin Features
- **Room Management**: Add, edit, and delete rooms
- **Room Availability**: Toggle room availability status
- **Booking Overview**: View all bookings across the system
- **User Management**: View booking details for all users

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Role-Based Access Control**: Admin and user roles
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Proper CORS setup for frontend-backend communication
- **Security Headers**: Helmet for security headers

## Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing
- **Express-validator**: Input validation
- **Helmet**: Security headers
- **Rate-limiting**: DDoS protection

### Frontend
- **React**: UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **React Datepicker**: Date selection

## Project Structure

```
ASSIGNMENT_COMPANY/
├── backend/
│   ├── models/
│   │   ├── User.js          # User model with password hashing
│   │   ├── Room.js          # Room model with availability
│   │   └── Booking.js       # Booking model with overlap prevention
│   ├── controllers/
│   │   ├── authController.js    # Authentication business logic
│   │   ├── roomController.js    # Room management business logic
│   │   └── bookingController.js # Booking business logic
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── rooms.js         # Room CRUD operations
│   │   └── bookings.js      # Booking operations with overlap check
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── server.js            # Express server setup
│   ├── seed.js              # Database seeding script
│   ├── package.json         # Backend dependencies
│   ├── .env.example         # Environment variables template
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js    # Navigation component
│   │   ├── context/
│   │   │   └── AuthContext.js # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.js     # Login page
│   │   │   ├── Register.js  # Registration page
│   │   │   ├── RoomList.js  # Room listing with filters
│   │   │   ├── BookRoom.js  # Booking form with date validation
│   │   │   ├── BookingHistory.js # User's booking history
│   │   │   └── AdminPanel.js # Admin dashboard
│   │   ├── utils/
│   │   │   └── api.js       # API client with interceptors
│   │   ├── App.js           # Main app with routing
│   │   ├── index.js         # Entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   ├── .env.example         # Environment variables template
│   ├── .env                 # Environment variables
│   └── tailwind.config.js   # Tailwind CSS configuration
└── README.md                # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (installed and running)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy .env.example to .env
cp .env.example .env
```

4. Edit `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel-booking
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy .env.example to .env
cp .env.example .env
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Rooms
- `GET /api/rooms` - Get all rooms (with optional filters)
- `GET /api/rooms/:id` - Get single room
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)
- `DELETE /api/rooms/:id` - Delete room (admin only)

### Bookings
- `GET /api/bookings` - Get bookings (user's own or all for admin)
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking (with overlap prevention)
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/room/:roomId/availability` - Check room availability

## Double Booking Prevention

The system implements robust double booking prevention through:

1. **Overlap Detection Algorithm**: Before creating a booking, the system checks for any existing bookings that overlap with the requested dates using multiple overlap scenarios:
   - New booking starts during an existing booking
   - New booking ends during an existing booking
   - New booking completely contains an existing booking
   - Existing booking completely contains the new booking


2. **Real-time Availability Check**: The booking form checks room availability in real-time as users select dates.

3. **Atomic Operations**: Booking creation is atomic to prevent race conditions.

## Validation & Error Handling

### Server-side Validation
- Email format validation
- Password strength requirements (min 6 characters)
- Date validation (check-out must be after check-in)
- Guest count validation (cannot exceed room capacity)
- Room availability validation
- Price and capacity numeric validation

### Client-side Validation
- Form validation before submission
- Real-time feedback on user input
- Password confirmation matching
- Date range validation
- Guest count limits

### Error Handling
- Comprehensive error messages
- User-friendly error display
- API error interceptors
- Graceful degradation
- Loading states for async operations

## User Roles

### User
- Browse available rooms
- Book rooms
- View personal booking history
- Cancel own bookings

### Admin
- All user permissions
- Add/edit/delete rooms
- View all bookings
- Manage room availability

## Security Best Practices Implemented

1. **Password Security**: Passwords are hashed using bcrypt with salt rounds
2. **JWT Tokens**: Secure token-based authentication with expiration
3. **Environment Variables**: Sensitive data stored in environment variables
4. **Input Sanitization**: All inputs are validated and sanitized
5. **SQL Injection Prevention**: Using MongoDB with Mongoose ODM
6. **XSS Protection**: Helmet middleware for security headers
7. **Rate Limiting**: API rate limiting to prevent abuse
8. **CORS**: Proper CORS configuration
9. **Role-Based Access**: Middleware to protect admin routes
10. **Token Refresh**: Automatic token validation on protected route

## Testing the Application

1. **Register a new user** at `/register`
2. **Login** with your credentials at `/login`
3. **Browse rooms** on the home page
4. **Filter rooms** by type, price, or availability
5. **Book a room** by clicking "Book Now"
6. **Select dates** and number of guests
7. **View your bookings** in the booking history
8. **Cancel a booking** if needed

### Admin Testing

1. Register a user with admin role (manually set in database or create admin endpoint)
2. Access `/admin` to manage rooms and view all bookings
3. Add new rooms with different types and prices
4. View all system bookings


## Assumptions Made During Development

1. **MongoDB Local Installation**: The application assumes MongoDB is installed locally and running on the default port 27017. For production, this should be replaced with a cloud MongoDB instance (MongoDB Atlas).

2. **Single Admin User**: The system currently uses a single admin account created through the seed script. In a production environment, a more sophisticated user management system with multiple admin roles would be appropriate.

3. **Currency**: All prices are in Indian Rupees (₹). The system does not currently support multi-currency functionality.

4. **Time Zone**: All date operations use the local system time zone. For a global application, UTC time handling with user-specific time zones would be required.

5. **Email Notifications**: The system does not currently send email notifications for bookings, confirmations, or cancellations. This would require integration with an email service.

6. **Payment Processing**: No actual payment processing is implemented. The booking system assumes payment is handled externally.

7. **Room Images**: The system uses placeholder icons for room images. A production version would require image upload and storage functionality.


## AI-Assisted Development

This project was developed with the assistance of AI coding tools (Cascade AI). The AI helped accelerate development by:

- **Code Generation**: Rapidly generating boilerplate code for React components, Express routes, and Mongoose models, significantly reducing initial setup time.
- **Architecture Guidance**: Providing recommendations for implementing MVC pattern separation between routes and controllers, following industry best practices for scalable backend architecture.
- **Debugging Assistance**: Identifying and fixing issues such as the min price negative validation bug and helping restructure the codebase for better maintainability.
- **Security Implementation**: Suggesting and implementing security best practices including JWT authentication, bcrypt password hashing, input validation, and rate limiting.
- **Code Quality**: Ensuring consistent code style, proper error handling, and comprehensive validation throughout the application.

**Challenges Encountered**:
- Initial database seeding was required to populate rooms for testing
- Restructuring the backend to follow MVC pattern required careful separation of business logic from route handlers
- Implementing robust double booking prevention required complex overlap detection algorithms

The AI assistance was particularly valuable in maintaining code consistency across the full-stack application and ensuring that security best practices were implemented from the start.
