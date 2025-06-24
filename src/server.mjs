import express from 'express';
import { db,auth } from './config/firebase-config.js';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import cors from 'cors';
import { sendSignInLinkToEmail } from "firebase/auth";
import { pollyClient } from './config/aws-config.js';
import {SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import {googleStorage,bucketName } from './middleware/googleCloud.mjs';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const actionCodeSettings = {
  url: 'https://firebase.google.com/docs/firestore/query-data/get-data', // replace actual URL with my app's URL later
  handleCodeInApp: true,
};



app.post('/api/email', async (req, res) => { // login with email
  const { inputEmail } = req.body;
  if (!inputEmail) {
    return res.status(400).send('no email provided');
  }
  const q = query(collection(db, 'users'), where('email', '==', inputEmail));
  const querySnapshot = await getDocs(q);
  try {
    if (!querySnapshot.empty) {
      await sendSignInLinkToEmail(auth, inputEmail, actionCodeSettings);
      return res.status(200).send(querySnapshot.docs[0].data());
    } else {
      res.status(404).send({
        Title: 'Success',
        Message: 'User not found',
        Status: 'success',
      });
    }
  } catch (error) {
    console.error('Error querying Firestore:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/api/learning/:level', async (req, res) => {
  const { level } = req.params;
  if ( !level ) {
    return res.status(400).send('level is required');
  }
  try {
    const q = query(collection(db, 'lessons'), where('level', '==', level));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const result = querySnapshot.docs.map (doc => {
        const data = doc.data();
        return {
          lessonName: data.lessonName,
          description: data.description,
          creator: data.creator,
          createdAt:  new Date(data.createAt?.seconds * 1000).toLocaleString('fi-FI', {
              timeZone: 'Europe/Helsinki',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          })
        };
      });
      return res.status(200).json({result});
    } else {
      return res.status(404).send({
        Title: 'Success',
        Message: 'Lesson not found',
        Status: 'success',
      });
    }
  } catch (error) {
    console.error('Error querying Firestore:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/api/learning/:level/:lesson', async (req, res) => {
  const { level, lesson } = req.params;
  if (!lesson || !level ) {
    return res.status(400).send('lesson and level are required');
  }
  try {
    const q = query(collection(db, 'lessons'), where('lessonName', '==', lesson), where('level', '==', level));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs[0].data();
    
    if (!querySnapshot.empty) {
      const command = new SynthesizeSpeechCommand({        // 
          Text: `<speak><prosody rate="80%">${data.description}</prosody></speak>`,
          OutputFormat: 'mp3',
          VoiceId: 'Suvi', 
          LanguageCode: 'fi-FI',
          Engine: 'neural',
          TextType: 'ssml' 
      });
      const { AudioStream } = await pollyClient.send(command); 
      const chunks = [];
      for await (const chunk of AudioStream) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);
      const audioBase64 = audioBuffer.toString('base64');
      const result = {
        lessonName: data.lessonName,
        description: data.description,
        descriptionAudio: audioBase64, // convert description to base64 audio
        level: data.level,
        creator: data.creator,
        createdAt:  new Date(data.createAt?.seconds * 1000).toLocaleString('fi-FI', {
            timeZone: 'Europe/Helsinki',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
      };
      return res.status(200).json({result});
    } else {
      return res.status(404).send({
        Title: 'Success',
        Message: 'Lesson not found',
        Status: 'success',
      });
    }
  } catch (error) {
    console.error('Error querying Firestore:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/api/studying/:level/:lesson/:module/:part', async (req, res) => {
  const { level, lesson, module, part } = req.params;
  if (!lesson || !level || !module || !part) {
    return res.status(400).send('lesson level, module, and part are required');
  }
  try {
    const q = query(collection(db, 'lessons'), where('lessonName', '==', lesson), where('level', '==', level));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs[0].data();
    const selectedPart = data?.[module]?.[part];  // access data (in data has module Object and Part Object)                                                                              
    if (!querySnapshot.empty) {                   // but we only want to get a whole part Object
      const result = {
        [part]: selectedPart // show part object
      };
      for (const questionKey of Object.keys(result[part])) { // chỉnh part object phần script qua mp3 bằng AWS Polly
        const script = result[part][questionKey].script;
        const command = new SynthesizeSpeechCommand({        
          Text: `<speak><prosody rate="80%">${script}</prosody></speak>`,
          OutputFormat: 'mp3',
          VoiceId: 'Suvi', 
          LanguageCode: 'fi-FI',
          Engine: 'neural',
          TextType: 'ssml'
        });
        const { AudioStream } = await pollyClient.send(command); 
        const chunks = [];
        for await (const chunk of AudioStream) {
          chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);
        const audioBase64 = audioBuffer.toString('base64');            // sau đó mp3 sang string base64
        result[part][questionKey].audioBase64 = audioBase64;
      }
      return res.status(200).json({result});
    } else {
      return res.status(404).send({
        Title: 'Success',
        Message: 'Lesson not found',
        Status: 'success',
      });
    }
  } catch (error) {
    console.error('Error querying Firestore:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/new_lesson', async (req, res) => {
  const { lessonName, description, creator,level,challenge } = req.body; 
  if (!lessonName || !description || !creator || !level || !challenge) {
    return res.status(400).send('All fields are required');
  }
  try {
    const q = query(collection(db, 'lessons'), where('lessonName', '==', lessonName.toLowerCase()), where('level', '==', level));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return res.status(400).json({
        Title: 'Error',
        Message: 'Lesson already exists',
        Status: 'error',
      });
    } else if (querySnapshot.empty) {
      const docRef = await addDoc(collection(db, 'lessons'), {
        lessonName: lessonName.toLowerCase(),
        description: description,
        creator: creator,
        level: level,
        challenge: challenge,
        createdAt: new Date(),
      });

      res.status(201).json({
        Title: 'Success',
        Message: 'User added successfully',
        Status: 'success',
        userId: docRef.id,
      });
    }
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});