import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatHandler from './api/chat.js';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Mock the Vercel serverless environment request/response objects
app.post('/api/chat', async (req, res) => {
  try {
    await chatHandler(req, res);
  } catch (error) {
    console.error('Error in chat handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Local API server running at http://localhost:${port}`);
});
