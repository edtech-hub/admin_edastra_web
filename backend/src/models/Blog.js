const mongoose = require('mongoose');

const additionalTagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, { _id: false });

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    image: {
        type: String,
        required: [true, 'Image is required'],
        trim: true
    },
    authorName: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true,
        maxlength: [100, 'Author name cannot be more than 100 characters']
    },
    authorCompany: {
        type: String,
        required: [true, 'Author company is required'],
        trim: true,
        maxlength: [100, 'Author company cannot be more than 100 characters']
    },
    readingTime: {
        type: String,
        required: [true, 'Reading time is required'],
        trim: true,
        maxlength: [20, 'Reading time cannot be more than 20 characters']
    },
    mainTag: {
        type: String,
        required: [true, 'Main tag is required'],
        trim: true,
        uppercase: true,
        maxlength: [50, 'Main tag cannot be more than 50 characters']
    },
    additionalTags: [additionalTagSchema],
    isVisible: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better performance
blogSchema.index({ isVisible: 1, createdAt: -1 });
blogSchema.index({ mainTag: 1 });

module.exports = mongoose.model('Blog', blogSchema);