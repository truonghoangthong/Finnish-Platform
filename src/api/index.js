import { createServer } from '../src/server.mjs';

export default async function handler(req, res) {
  try {
    const app = await createServer();
    return app(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}