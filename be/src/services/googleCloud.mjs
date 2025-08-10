import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
dotenv.config();

const googleStorage = new Storage({
  keyFilename: './src/config/finnishplatform_config.json',
  projectId: 'finnishplatform',
});

const bucketName = `${process.env.GOOGLE_CLOUD_BUCKET_NAME}`;
export { googleStorage,bucketName };