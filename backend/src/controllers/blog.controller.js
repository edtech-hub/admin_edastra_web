const Blog = require('../models/Blog');
const AuditLog = require('../models/AuditLog');

// Get all blogs
const getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, isVisible, mainTag } = req.query;

        const filter = {};
        if (isVisible !== undefined) {
            filter.isVisible = isVisible === 'true';
        }
        if (mainTag) {
            filter.mainTag = mainTag.toUpperCase();
        }

        const blogs = await Blog.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Blog.countDocuments(filter);

        res.json({
            success: true,
            data: blogs,
            pagination: {
                current: page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blogs',
            error: error.message
        });
    }
};

// Get single blog by ID
const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        res.json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog',
            error: error.message
        });
    }
};

// Create new blog
const createBlog = async (req, res) => {
    try {
        const blogData = req.body;

        // Validate required fields
        const requiredFields = ['title', 'description', 'image', 'authorName', 'authorCompany', 'readingTime', 'mainTag'];
        for (const field of requiredFields) {
            if (!blogData[field]) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        // Ensure mainTag is uppercase
        blogData.mainTag = blogData.mainTag.toUpperCase();

        const blog = new Blog(blogData);
        await blog.save();

        // Log the action
        if (req.user) {
            await AuditLog.create({
                userId: req.user.id,
                action: 'create',
                resource: 'blog',
                resourceId: blog._id,
                details: { title: blog.title }
            });
        }

        res.status(201).json({
            success: true,
            data: blog,
            message: 'Blog created successfully'
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating blog',
            error: error.message
        });
    }
};

// Update blog
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Ensure mainTag is uppercase if provided
        if (updateData.mainTag) {
            updateData.mainTag = updateData.mainTag.toUpperCase();
        }

        updateData.updatedAt = new Date();

        const blog = await Blog.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Log the action
        if (req.user) {
            await AuditLog.create({
                userId: req.user.id,
                action: 'update',
                resource: 'blog',
                resourceId: blog._id,
                details: { title: blog.title }
            });
        }

        res.json({
            success: true,
            data: blog,
            message: 'Blog updated successfully'
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating blog',
            error: error.message
        });
    }
};

// Delete blog
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Log the action
        if (req.user) {
            await AuditLog.create({
                userId: req.user.id,
                action: 'delete',
                resource: 'blog',
                resourceId: id,
                details: { title: blog.title }
            });
        }

        res.json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting blog',
            error: error.message
        });
    }
};

// Toggle blog visibility
const toggleBlogVisibility = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        blog.isVisible = !blog.isVisible;
        blog.updatedAt = new Date();
        await blog.save();

        // Log the action
        if (req.user) {
            await AuditLog.create({
                userId: req.user.id,
                action: 'toggle_visibility',
                resource: 'blog',
                resourceId: blog._id,
                details: {
                    title: blog.title,
                    isVisible: blog.isVisible
                }
            });
        }

        res.json({
            success: true,
            data: blog,
            message: `Blog ${blog.isVisible ? 'shown' : 'hidden'} successfully`
        });
    } catch (error) {
        console.error('Error toggling blog visibility:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling blog visibility',
            error: error.message
        });
    }
};

// Get unique main tags
const getMainTags = async (req, res) => {
    try {
        const tags = await Blog.distinct('mainTag');

        res.json({
            success: true,
            data: tags.sort()
        });
    } catch (error) {
        console.error('Error fetching main tags:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching main tags',
            error: error.message
        });
    }
};

module.exports = {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleBlogVisibility,
    getMainTags
};