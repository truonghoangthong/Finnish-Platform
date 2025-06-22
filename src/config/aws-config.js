import dotenv from 'dotenv';
import { PollyClient } from '@aws-sdk/client-polly';
dotenv.config();

const pollyClient = new PollyClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export {pollyClient};