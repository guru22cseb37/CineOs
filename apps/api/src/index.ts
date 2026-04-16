import 'dotenv/config';
import app from './app';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineos';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const server = createServer(app);
const _io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
  }
});

export const redisClient = new Redis(REDIS_URL);

async function startServer() {
  mongoose.connect(MONGODB_URI).then(() => {
    console.log('📦 Connected to MongoDB');
  }).catch((error) => {
    console.warn('⚠️ Failed to connect to MongoDB. Offline features (Watchlist/Auth) will be unavailable:', error.message);
  });

  redisClient.on('connect', () => console.log('🔴 Connected to Redis'));
  redisClient.on('error', (error) => {
    // Suppress the constant redis error spam if container is down
    if ((error as any).code === 'ECONNREFUSED') return;
    console.warn('⚠️ Redis error:', error.message);
  });

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
