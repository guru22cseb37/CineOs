import { Router } from 'express';
import moviesRouter from './movies';
import recommendationsRouter from './recommendations';
import authRouter from './auth';
import usersRouter from './users';
import actorsRouter from './actors';
import searchRouter from './search';
import aiRouter from './ai';
import socialRouter from './social';

const router = Router();

router.use('/movies', moviesRouter);
router.use('/recommendations', recommendationsRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/actors', actorsRouter);
router.use('/search', searchRouter);
router.use('/ai', aiRouter);
router.use('/social', socialRouter);

export default router;
