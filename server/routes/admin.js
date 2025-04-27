const express = require('express');
const adminrouter = express.Router();
const BlogPost = require('../models/blogpost');
const Adminform = require('../models/Adminforms');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('../config/multerConfig');
const jwtSecret = process.env.JWT_SECRET;

const adminLayout = '../views/layouts/adminLogin.ejs';

const authMiddleware = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.redirect('/admin');
        }
        req.userId = decoded.id;
        next();
    });
}

adminrouter.get('/', async (req, res) => {
    try {
        res.render('admin/login', { title: 'Admin Login-Page', layout: adminLayout });
    } catch (error) {
        console.error(' Error rendering login page:', error);
        res.status(500).send('Error loading login page');
    }
});

adminrouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            console.log(' Missing username or password');
            return res.status(400).send('Missing username or password');
        }

        const admin = await Adminform.findOne({ username });

        if (!admin) {
            console.log(' Admin not found:', username);
            return res.status(401).send('Invalid username or password');
        }

        console.log(' Admin found:', username);

        if (!admin.password || typeof admin.password !== 'string') {
            console.log(' Stored password is invalid:', admin.password);
            return res.status(500).send('Server error: Invalid stored password');
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log(' Incorrect password for user:', username);
            return res.status(401).send('Invalid username or password');
        }

        console.log(' Password matched for:', username);

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log(' Token generated:', token);

        res.cookie('jwt', token, { httpOnly: true });

        console.log(' Admin logged in successfully:', username);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(' Login error:', error);
        res.status(500).send(`Error processing request: ${error.message}`);
    }
});

adminrouter.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            console.log(' Missing username or password');
            return res.status(400).send('Missing username or password');
        }

        const existingAdmin = await Adminform.findOne({ username });
        if (existingAdmin) {
            console.log(' Username already exists:', username);
            return res.status(400).send('Username already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Adminform({ username, password: hashedPassword });

        await newAdmin.save();
        console.log('Admin registered successfully:', username);

        res.redirect('/admin'); 
    } catch (error) {
        console.error(' Registration error:', error);
        res.status(500).send(`Error processing request: ${error.message}`);
    }
});

adminrouter.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const data = await BlogPost.find()
        res.render('admin/dashboard' ,{title: 'Admin Dashboard', data});
    } catch (error) {
        console.error(' Dashboard render error:', error);
        res.status(500).send('Error loading dashboard');
    }
});

adminrouter.get('/add-posts', authMiddleware, async (req, res) => {
    try {
        res.render('admin/add-posts' ,{title: 'Add Blogs'});
    } catch (error) {
        console.error(' Dashboard render error:', error);
        res.status(500).send('Error adding blogs');
    }
});

adminrouter.post('/add-posts', authMiddleware, upload.single('image'), async (req, res) => {
    console.log('POST request received for /admin/add-posts');
    const { title, body } = req.body;
    const image = req.file ? req.file.path : ''; 

    console.log('Received data:', { title, body, image });

    try {
        if (!title || !body) {
            return res.status(400).send('Title and body are required');
        }

        const newPost = new BlogPost({
            title,
            body,
            image,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });

        await newPost.save();
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

adminrouter.get('/edit-posts/:id', authMiddleware, async (req, res) => {
    try {
        console.log("Received ID:", req.params.id);

        const data = await BlogPost.findById(req.params.id);
        if (!data) {
            console.log("No post found for ID:", req.params.id);
            return res.status(404).send('Blog post not found');
        }

        res.render('admin/edit-posts', { title: 'Edit Blog', data });
    } catch (error) {
        console.error('Error rendering edit page:', error);
        res.status(500).send('Error loading edit page');
    }
});

adminrouter.put('/edit-posts/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const updateData = {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now(),
        };

        
        if (req.file) {
            updateData.image = req.file.path; 
        }

        await BlogPost.findByIdAndUpdate(req.params.id, updateData);
        res.redirect(`/admin/dashboard`);
        console.log('Blog post updated:', req.params.id);
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).send('Error updating blog post');
    }
});

adminrouter.delete('/delete-posts/:id', authMiddleware, async (req, res) => {
    try {
        console.log("Received DELETE request for ID:", req.params.id);
        await BlogPost.findByIdAndDelete(req.params.id);

        console.log("Blog post deleted:", req.params.id);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Error deleting blog post:", error);
        res.status(500).send("Error deleting blogs");
    }
});

module.exports = adminrouter;
