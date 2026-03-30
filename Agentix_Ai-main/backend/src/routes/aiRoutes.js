const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const auth = require('../middleware/auth');

// Chat & Workflow
router.post('/chat', auth, aiController.handleChat);
router.get('/chat/history', auth, aiController.getHistory);

// Document Intelligence
router.post('/upload', auth, upload.single('document'), aiController.handleUpload);

// Task Management
router.get('/tasks', auth, aiController.getTasks);
router.post('/tasks', auth, aiController.createTask);
router.patch('/tasks/:id/toggle', auth, aiController.toggleTaskStatus);
router.delete('/tasks/:id', auth, aiController.deleteTask);

module.exports = router;
