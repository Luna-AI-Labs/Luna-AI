import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { geminiService } from './services/gemini.js';
import { opikMiddleware } from './services/opik.js';
import { initDb } from './db/database.js'; // Import initDb
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';
import cycleRoutes from './routes/cycle.js';
import modeRoutes from './routes/modes.js';
import predictionRoutes from './routes/prediction.js';
import userRoutes from './routes/user.js';

dotenv.config();

// Initialize Database Schema
initDb();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(opikMiddleware); // Trace all requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/modes', modeRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    services: {
      gemini: !!process.env.GEMINI_API_KEY,
      opik: !!process.env.OPIK_API_KEY
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌙 Luna AI Server running on port ${PORT}`);
  console.log(`📊 Opik tracing: ${process.env.OPIK_API_KEY ? 'enabled' : 'disabled'}`);
});

export default app;
