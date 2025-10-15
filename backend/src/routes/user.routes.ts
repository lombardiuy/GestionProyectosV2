import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermissionMiddleware } from '../middleware/requirePermission.middleware';
import { requireAnyPermissionMiddleware } from '../middleware/requireAnyPermission.middleware';
import {
  getAllUsers,
  selectUserById,
  createUser,
  getUserRoles,
  saveUserRole,
  setUserPassword,
  resetUserPassword, 
  suspensionUser
} from '../controllers/user.controller'


const router = Router()

router.get('/list', authMiddleware, requirePermissionMiddleware("USERS_VIEW"), getAllUsers)
router.get('/roles', authMiddleware,  authMiddleware, requireAnyPermissionMiddleware('USERS_VIEW', 'USERS_ROLE_VIEW'), getUserRoles )
router.get('/select/:id', authMiddleware, requirePermissionMiddleware("USERS_EDIT"), selectUserById)

router.post('/create', authMiddleware,requirePermissionMiddleware("USERS_CREATE"), createUser)
router.post('/resetUserPassword', authMiddleware, requirePermissionMiddleware("USERS_PASSWORD_RESET"),resetUserPassword)
router.post('/setUserPassword', setUserPassword)
router.post('/suspension', authMiddleware, requireAnyPermissionMiddleware('USERS_SUSPEND', 'USERS_UNSUSPEND'), suspensionUser)
router.post('/roles/create', authMiddleware,requirePermissionMiddleware("USERS_ROLE_CREATE"), saveUserRole)


export default router
