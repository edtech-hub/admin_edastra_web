const express = require('express');
const router = express.Router();
const {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleBlogVisibility,
    getMainTags
} = require('../controllers/blog.controller');
const { auth } = require('../middleware/auth');

// Public routes (for main website consumption)
router.get('/', getAllBlogs);
router.get('/tags', getMainTags);
router.get('/:id', getBlogById);

// Protected routes (for admin panel) - auth temporarily disabled for testing
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.patch('/:id/visibility', toggleBlogVisibility);
router.delete('/:id', deleteBlog);

module.exports = router;