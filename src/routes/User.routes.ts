import express from 'express';
import UserController from '../controllers/UserController';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';
import extractJWT from '../middleware/ExtractJWT';

const router = express.Router();

router.get('/validate', extractJWT, UserController.validateToken);
router.post(
  '/register',
  ValidateSchema(Schemas.user.register),
  UserController.register
);
router.post('/login', UserController.login);
router.get('/get/all', UserController.getAllUsers);

export = router;
