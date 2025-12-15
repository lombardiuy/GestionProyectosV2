import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermissionMiddleware } from '../middleware/requirePermission.middleware';
import { requireAnyPermissionMiddleware } from '../middleware/requireAnyPermission.middleware';
import {
  getAllUsers,
  selectUserById,
  createUser,
  updateUser,
  updateUserProfile,
  getUserRoles,
  saveUserRole,
  setUserPassword,
  resetUserPassword, 
  suspensionUser
} from '../controllers/user.controller';

import { validateDto } from '../middleware/validateDto.middleare';

import { CreateUserDto } from '../dto/users/createUser.dto';
import { UpdateUserDto } from '../dto/users/updateUser.dto';
import { UpdateUserProfileDto } from '../dto/users/updateUserProfile.dto';
import { ResetUserPasswordDto } from '../dto/users/resetUserPassword.dto';
import { SetUserPasswordDto } from '../dto/users/setUserPassword.dto';
import { SuspendUserDto } from '../dto/users/suspendUser.dto';
import { SaveUserRoleDto } from '../dto/users/saveUserRole.dto';


const router = Router()

//USERS

router.get('/', authMiddleware, requirePermissionMiddleware("USER_VIEW"), getAllUsers)
router.get('/select/:id', authMiddleware, requirePermissionMiddleware("USER_EDIT"), selectUserById)

router.post('/create', authMiddleware,requirePermissionMiddleware("USER_CREATE"),  validateDto(CreateUserDto),  createUser)
router.put('/update/:id',authMiddleware,requirePermissionMiddleware("USER_EDIT"),validateDto(UpdateUserDto),updateUser);
router.put('/updateUserProfile', authMiddleware, validateDto(UpdateUserProfileDto), updateUserProfile);
router.post('/resetUserPassword', authMiddleware, requirePermissionMiddleware("USER_PASSWORD_RESET"), validateDto(ResetUserPasswordDto), resetUserPassword)
router.post('/setUserPassword', validateDto(SetUserPasswordDto), setUserPassword)
router.post('/suspension', authMiddleware,requirePermissionMiddleware("USER_SUSPENSION"), validateDto(SuspendUserDto), suspensionUser)


//USER ROLES

router.get('/roles', authMiddleware, requireAnyPermissionMiddleware('USER_VIEW', 'USER_ROLE_VIEW'), getUserRoles )
router.post('/roles/create', authMiddleware,requirePermissionMiddleware("USER_ROLE_CREATE"),  validateDto(SaveUserRoleDto), saveUserRole)




export default router
