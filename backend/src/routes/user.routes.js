const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
} = require('../controllers/user.controller');

router.use(auth);
router.get('/stats', getDashboardStats);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;
