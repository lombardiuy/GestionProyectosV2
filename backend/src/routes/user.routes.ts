import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import {
  getAllUsers,
  selectUserById,
  createUser,
  removeUser,
  changeUserPassword,
  getUserRoles,
  createRole,
} from '../controllers/user.controller'

const router = Router()

router.get('/list', getAllUsers)
router.get('/roles', getUserRoles)
router.get('/select/:id', selectUserById)

router.post('/create', authMiddleware, createUser)
router.post('/roles/create', authMiddleware, createRole)

router.delete('/delete/:id', removeUser)
router.post('/UserChangePassword', changeUserPassword)

export default router
