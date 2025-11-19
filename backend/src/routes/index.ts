import { Router } from 'express'
import appRoutes from './app.routes'
import auditTrail from './auditTrail.routes'
import authRoutes from './auth.routes'
import userRoutes from './user.routes'
import fileRoutes from './file.routes'


const router = Router()

router.use('/app',  appRoutes)
router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/file', fileRoutes);
router.use('/auditTrail', auditTrail);

export default router
