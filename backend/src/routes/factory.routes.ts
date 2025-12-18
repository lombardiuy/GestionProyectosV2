import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermissionMiddleware } from '../middleware/requirePermission.middleware';

import {
  getAllFactories, 
  selectFactoryById, selectFactoryByName, createFactory, updateFactory, updateFactoryRoute,  createFactoryRoute, suspensionFactory, suspensionFactoryRoute
} from '../controllers/factory.controller';

import { validateDto } from '../middleware/validateDto.middleare';
import { UpdateFactoryDto } from '../dto/factories/updateFactory.dto';
import { CreateFactoryDto } from '../dto/factories/createFactory.dto';
import { CreateFactoryRouteDto } from '../dto/factories/createFactoryRoute.dto';
import { SuspendFactoryRouteDto } from '../dto/factories/suspendFactoryRoute.dto';
import { SuspendFactoryDto } from '../dto/factories/suspendFactory.dto';
import { UpdateFactoryRouteDto } from '../dto/factories/updateFactoryRoute.dto';










const router = Router()

//FACTORY ROUTES

router.get('/', authMiddleware, requirePermissionMiddleware("FACTORY_VIEW"), getAllFactories)
router.get('/select/:id', authMiddleware, requirePermissionMiddleware("FACTORY_VIEW"), selectFactoryById)
router.get('/selectByName/:factoryName', authMiddleware, requirePermissionMiddleware("FACTORY_VIEW"), selectFactoryByName)
router.post('/create', authMiddleware,requirePermissionMiddleware("FACTORY_CREATE"),  validateDto(CreateFactoryDto),  createFactory)
router.put('/update/:id',authMiddleware,requirePermissionMiddleware("FACTORY_EDIT"),validateDto(UpdateFactoryDto),updateFactory);

router.post('/suspension', authMiddleware,requirePermissionMiddleware("FACTORY_SUSPENSION"), validateDto(SuspendFactoryDto), suspensionFactory)
router.post('/route/create', authMiddleware,requirePermissionMiddleware("FACTORY_ROUTE_CREATE"),  validateDto(CreateFactoryRouteDto),  createFactoryRoute)
router.put('/route/update/:id', authMiddleware,requirePermissionMiddleware("FACTORY_ROUTE_EDIT"),  validateDto(UpdateFactoryRouteDto),  updateFactoryRoute)
router.post('/route/suspension', authMiddleware,requirePermissionMiddleware("FACTORY_ROUTE_SUSPENSION"), validateDto(SuspendFactoryRouteDto), suspensionFactoryRoute)



export default router
