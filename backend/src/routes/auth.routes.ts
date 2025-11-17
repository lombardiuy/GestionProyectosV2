import { Router } from 'express';
import {login, getDevToken} from '../controllers/auth.controller'
import { validateDto } from '../middleware/validateDto.middleare';
import { LoginDto } from '../dto/auth/login.dto';

const router = Router();

router.post('/login',   validateDto(LoginDto), login);
router.get('/getDevToken', getDevToken);

export default router;
