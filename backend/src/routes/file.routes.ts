import { Router } from 'express';
import * as fileController from '../controllers/file.controller';

const router = Router();

router.post('/save', fileController.saveFile);
router.delete('/delete/:type/:fileName', fileController.deleteFile);

export default router;
