import { Router } from 'express';
import { config } from '../config.js';
import { getDbStatus } from '../services/requestService.js';

const router = Router();

router.get('/', (req, res) => {
  const database = getDbStatus();
  const status = database.connected ? 'ok' : 'error';
  res.status(database.connected ? 200 : 503).json({
    status,
    env: config.env,
    uptime: process.uptime(),
    database,
  });
});

export default router;
