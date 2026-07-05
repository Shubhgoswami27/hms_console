import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import staffRoutes from './routes/staffRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import bedRoutes from './routes/bedRoutes';
import resourceRoutes from './routes/resourceRoutes';
import nurseCallRoutes from './routes/nurseCallRoutes';
import billingRoutes from './routes/billingRoutes';
import reportRoutes from './routes/reportRoutes';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development, allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder (fallback for report uploads)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'healthy', service: 'HMS Backend API', version: '1.0.0' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/nurse-calls', nurseCallRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);

// Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
  console.log(`New WebSocket client connected: ${socket.id}`);

  // Join client to a room based on role or specific ward
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined room: ${room}`);
  });

  // Nurse Call System real-time notification
  socket.on('send_nurse_call', (data) => {
    // broadcast to all nurses in the "nurses" room
    io.to('NURSE').emit('receive_nurse_call', data);
    console.log('Broadcasted nurse call:', data);
  });

  socket.on('respond_nurse_call', (data) => {
    io.to('NURSE').to('PATIENT').emit('nurse_call_status_updated', data);
    console.log('Nurse call status updated:', data);
  });

  // Bed Availability live update
  socket.on('update_bed', (data) => {
    // broadcast to all users
    io.emit('bed_updated', data);
    console.log('Bed updated and broadcasted:', data);
  });

  // Resources availability update
  socket.on('update_resource', (data) => {
    io.emit('resource_updated', data);
    console.log('Resource updated and broadcasted:', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`HMS Backend Server running on port ${PORT}`);
});

export { io };
