import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermissionMiddleware } from '../middleware/requirePermission.middleware';

import {
  getAllFactories, 
  selectFactoryById, createFactory, createFactoryRoute
} from '../controllers/factory.controller';
import { validateDto } from '../middleware/validateDto.middleare';
import { CreateFactoryDto } from '../dto/factories/createFactory.dto';
import { CreateFactoryRouteDto } from '../dto/factories/createFactoryRoute.dto';









const router = Router()

//FACTORY ROUTES

router.get('/', authMiddleware, requirePermissionMiddleware("FACTORIES_VIEW"), getAllFactories)
router.get('/select/:id', authMiddleware, requirePermissionMiddleware("FACTORIES_EDIT"), selectFactoryById)
router.post('/create', authMiddleware,requirePermissionMiddleware("FACTORIES_CREATE"),  validateDto(CreateFactoryDto),  createFactory)
router.post('/route/create', authMiddleware,requirePermissionMiddleware("FACTORIES_CREATE"),  validateDto(CreateFactoryRouteDto),  createFactoryRoute)


export default router
