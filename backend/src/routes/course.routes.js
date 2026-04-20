const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/course.controller');

router.use(auth);
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', adminOnly, deleteCourse);

module.exports = router;
