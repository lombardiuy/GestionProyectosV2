import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { requirePermission } from '../middleware/requirePermission.middleware'
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

router.get('/list', authMiddleware, requirePermission("USERS_VIEW"), getAllUsers)
router.get('/roles', getUserRoles)
router.get('/select/:id', selectUserById)

router.post('/create', authMiddleware, createUser)
router.post('/resetUserPassword', authMiddleware, resetUserPassword)
router.post('/setUserPassword', setUserPassword)
router.post('/suspension', authMiddleware, suspensionUser)
router.post('/roles/create', authMiddleware, saveUserRole)


export default router
