import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import requestRoutes from './routes/requestRoutes.js';
import userRoutes from './routes/userRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // ① CORS ต้องมาก่อนทุกอย่าง — ไม่งั้นเบราว์เซอร์จะถูกบล็อกก่อนถึง route
  app.use(cors({ origin: config.corsOrigin }));

  // ② logging — dev อ่านง่าย · production กระชับสำหรับเก็บ log
  app.use(morgan(config.isProd ? 'combined' : 'dev'));

  // ③ อ่าน JSON body
  app.use(express.json());

  if (config.isProd) app.use(express.static(config.staticDir));

  // ④ route
  app.get('/', (req, res) => {
    res.json({ message: 'Campus Service API is running', version: '2.0.0' });
  });
  app.use('/api/health', healthRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/users', userRoutes);

  if (config.isProd) app.get(/^(?!\/api(?:\/|$)).*/, (req, res, next) => {
    res.sendFile('index.html', { root: config.staticDir }, (error) => {
      if (error) next(error);
    });
  });

  // ⑥ ปิดท้าย
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
