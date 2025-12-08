import { Router } from 'express'
import appRoutes from './app.routes'
import auditTrailRoutes from './auditTrail.routes'
import authRoutes from './auth.routes'
import userRoutes from './user.routes'
import fileRoutes from './file.routes'
import factoryRoutes from './factory.routes'


const router = Router()

router.use('/app',  appRoutes)
router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/file', fileRoutes);
router.use('/auditTrail', auditTrailRoutes);
router.use('/factories', factoryRoutes);

export default router
