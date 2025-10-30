import express from 'express'
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getUserStats
} from '../controllers/userController.js'
import { authMiddleware, isAdmin } from '../middleware/auth.js'
import {
  registerValidation,
  updateUserValidation,
  updateUserRoleValidation,
  userIdValidation,
  paginationValidation
} from '../middleware/validation.js'

const router = express.Router()

// All routes require admin authentication
router.use(authMiddleware, isAdmin)

// User management routes
router.get('/', paginationValidation, getUsers)
router.post('/', registerValidation, createUser)
router.get('/stats', getUserStats)
router.get('/:userId', userIdValidation, getUserById)
router.patch('/:userId', updateUserValidation, updateUser)
router.patch('/:userId/role', updateUserRoleValidation, updateUserRole)
router.patch('/:userId/toggle-status', userIdValidation, toggleUserStatus)
router.delete('/:userId', userIdValidation, deleteUser)

export default router