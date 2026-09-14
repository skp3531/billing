import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import env from './config/env';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Determine allowed origins from environment
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const additionalOrigins = process.env.ADDITIONAL_ALLOWED_ORIGINS 
      ? process.env.ADDITIONAL_ALLOWED_ORIGINS.split(',').map(url => url.trim()) 
      : [];
    const allowedOrigins = [clientUrl, 'https://skp3531.github.io', ...additionalOrigins];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});
