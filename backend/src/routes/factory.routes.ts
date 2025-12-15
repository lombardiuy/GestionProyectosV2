import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermissionMiddleware } from '../middleware/requirePermission.middleware';

import {
  getAllFactories, 
  selectFactoryById, createFactory, createFactoryRoute, suspensionFactory, suspensionFactoryRoute
} from '../controllers/factory.controller';
import { validateDto } from '../middleware/validateDto.middleare';
import { CreateFactoryDto } from '../dto/factories/createFactory.dto';
import { CreateFactoryRouteDto } from '../dto/factories/createFactoryRoute.dto';
import { SuspendFactoryRouteDto } from '../dto/factories/suspendFactoryRoute.dto';
import { SuspendFactoryDto } from '../dto/factories/suspendFactory.dto';









const router = Router()

//FACTORY ROUTES

router.get('/', authMiddleware, requirePermissionMiddleware("FACTORY_VIEW"), getAllFactories)
router.get('/select/:id', authMiddleware, requirePermissionMiddleware("FACTORY_EDIT"), selectFactoryById)
router.post('/create', authMiddleware,requirePermissionMiddleware("FACTORY_CREATE"),  validateDto(CreateFactoryDto),  createFactory)
router.post('/route/create', authMiddleware,requirePermissionMiddleware("FACTORY_CREATE"),  validateDto(CreateFactoryRouteDto),  createFactoryRoute)
router.post('/suspension', authMiddleware,requirePermissionMiddleware("FACTORY_SUSPENSION"), validateDto(SuspendFactoryDto), suspensionFactory)
router.post('/route/suspension', authMiddleware,requirePermissionMiddleware("FACTORY_ROUTE_SUSPENSION"), validateDto(SuspendFactoryRouteDto), suspensionFactoryRoute)



export default router
