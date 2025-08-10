import { createServer } from '../src/server.mjs';

export default function handler(req, res) {
  try {
    const app = createServer();
    return app(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
}