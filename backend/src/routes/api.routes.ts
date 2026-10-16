import { Router } from 'express';
import { getHealth, getMessage, postGreeting } from '../controllers/api.controller.js';

export const apiRouter = Router();

apiRouter.get('/health', getHealth);
apiRouter.get('/message', getMessage);
apiRouter.post('/greeting', postGreeting);
