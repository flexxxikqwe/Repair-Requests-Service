import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestController, userController } from './controllers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// --- Routes ---
app.get('/users', userController.list);

app.post('/requests', requestController.create);
app.get('/requests', requestController.list);
app.get('/requests/:id', requestController.getById);
app.post('/requests/:id/assign', requestController.assign);
app.post('/requests/:id/take', requestController.take);
app.post('/requests/:id/finish', requestController.finish);
app.post('/requests/:id/cancel', requestController.cancel);

// Global 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
