const express = require('express');
const errorHandler = require('./middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');

// Route imports
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const documentRoutes = require('./routes/documentRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// ---------- Body parsers ----------
app.json = express.json;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Health check ----------
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Collaborative Writing & Publishing Workspace API is running',
  });
});

// ---------- Swagger API Playground ----------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ---------- Mount routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/comments', commentRoutes);

// ---------- 404 handler ----------
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// ---------- Centralized error handler ----------
app.use(errorHandler);

module.exports = app;
