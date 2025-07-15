import express from 'express';
import { db,auth } from './config/firebase-config.js';
import { collection, addDoc, query, where, getDocs, updateDoc  } from 'firebase/firestore';
import cors from 'cors';
import { sendSignInLinkToEmail } from "firebase/auth";
import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import {googleStorage,bucketName } from './middleware/googleCloud.mjs';
import dotenv from 'dotenv';
import {evaluateTranslation} from './middleware/open_router.mjs';
import { command } from './middleware/awsPolly.mjs';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const actionCodeSettings = {
  url: 'https://firebase.google.com/docs/firestore/query-data/get-data', // replace actual URL with my app's URL later
  handleCodeInApp: true,
};


app.post('/api/evaluate', async (req, res) => {
  const { finnishSentence, userTranslation } = req.body;
  if (!finnishSentence || !userTranslation) {
    return res.status(400).send('no finnish Sentence provided or user transaction');
  }
  try {
    const result = await evaluateTranslation(finnishSentence , userTranslation);
    if (!result) {
      return res.status(404).send({
        Title: 'Error',
        Message: 'Evaluation not found',
        Status: 'error',
      });
    } 
    const response = {
      finnishSentence: finnishSentence,
      userTranslation: userTranslation,
      feedback: result,
    }
    res.status(200).json(response);
  } catch (error) {
    console.error('Error get feedback through OpenAI:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/email', async (req, res) => { // login with email
  const { inputEmail } = req.body;
  if (!inputEmail) {
    return res.status(400).send('no email provided');
  }
  const queryUser = query(collection(db, 'users'), where('email', '==', inputEmail));
  const querySnapshot = await getDocs(queryUser);
  try {
    if (!querySnapshot.empty) {
      await sendSignInLinkToEmail(auth, inputEmail, actionCodeSettings);
      return res.status(200).send(querySnapshot.docs[0].data());
    } else {
      res.status(404).send({
        Title: 'Error',
        Message: 'User not found',
        Status: 'Error',
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
    const queryLesson = query(collection(db, 'lessons'), where('level', '==', level));
    const querySnapshot = await getDocs(queryLesson);
    
    if (!querySnapshot.empty) {
      const result = querySnapshot.docs.map (doc => {
        const data = doc.data();
        return {
          lessonName: data.lessonName,
          description: data.description,
          lessonNumber: data.lessonNumber,
          imageLink: data.imageLink, 
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
        Title: 'Error',
        Message: 'Level not found',
        Status: 'Error',
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
    const queryLesson = query(collection(db, 'lessons'), where('lessonName', '==', lesson), where('level', '==', level));
    const querySnapshot = await getDocs(queryLesson);
    const data = querySnapshot.docs[0].data();
    
    if (!querySnapshot.empty) {
      const audioBase64 = await command(data.description);
      const result = {
        lessonName: data.lessonName,
        description: data.description,
        descriptionAudio: audioBase64, // convert description to base64 audio
        level: data.level,
        imageLink: data.imageLink,
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
        Title: 'Error',
        Message: 'Lesson not found',
        Status: 'Error',
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
    const queryLesson = query(collection(db, 'lessons'), where('lessonName', '==', lesson), where('level', '==', level));
    const querySnapshot = await getDocs(queryLesson);
    const data = querySnapshot.docs[0].data();
    const selectedPart = data?.[module]?.[part];  // access data (in data has module Object and Part Object)                                                                              
    if (!querySnapshot.empty) {                   // but we only want to get a whole part Object
      const result = {
        [part]: selectedPart // show part object
      };
      for (const questionKey of Object.keys(result[part]).filter(key => key !== 'imageLink')) { // chỉnh part object phần script qua mp3 bằng AWS Polly
        const script = result[part][questionKey].script;
        const audioBase64 = await command(script);
        result[part][questionKey].audioBase64 = audioBase64;
        if (result[part][questionKey].correctScript && result[part][questionKey].incorrectScript) { 
          const correctScript = result[part][questionKey].correctScript;
          const incorrectScript = result[part][questionKey].incorrectScript;
          const correctAudioBase64 = await command(correctScript);
          const incorrectAudioBase64 = await command(incorrectScript);
          result[part][questionKey].correctAudioBase64 = correctAudioBase64;
          result[part][questionKey].incorrectAudioBase64 = incorrectAudioBase64;
        }
      }
      return res.status(200).json({result});
    } else {
      return res.status(404).send({
        Title: 'Error',
        Message: 'Lesson not found',
        Status: 'Error',
      });
    }
  } catch (error) {
    console.error('Error querying Firestore:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/progress', async (req, res) => { // update progress of a specific lesson
    const { userId, level, lesson, module, progress } = req.body;
    if (!userId || !level || !lesson || !module || !progress) {
      return res.status(400).send('userId, level, lesson, module and progress are required');
    }
    try {
      const queryLearner = query(collection(db, 'learners'), where('userId', '==', userId));
      const queryLesson = query(collection(db, 'lessons'), where('lessonName', '==', lesson));
      const querySnapshotLesson = await getDocs(queryLesson);
      const querySnapshotUser = await getDocs(queryLearner);
      if (querySnapshotLesson.empty) {
        return res.status(404).json({
          Title: 'Error',
          Message: 'Lesson not found',
          Status: 'error',
        });
    } else if (!querySnapshotLesson.empty && !querySnapshotUser.empty) {
      const docRef = querySnapshotUser.docs[0].ref;
      const data = querySnapshotUser.docs[0].data();
      await updateDoc(docRef, { [`progress.${level}.${lesson}.${module}`]: progress });
      return res.status(200).json({
        Title: 'Success',
        Message: 'Progress updated successfully',
        Status: 'success',
      });
    }
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});


app.get('/api/progress/:userId/:level/:lesson', async (req, res) => { // fetch progress of a specific lesson
  const { userId, level, lesson } = req.params;
  if (!userId || !level || !lesson) {
    return res.status(400).send('userId, level, and lesson are required');
  }
  try {
    const queryLearner = query(collection(db, 'learners'), where('userId', '==', userId));
    const querySnapshot = await getDocs(queryLearner);
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      const selectedProgress = data?.['progress']?.[level]?.[lesson];
      const result = {
        [lesson]: selectedProgress // show lesson object
      };
      return res.status(200).json({ result });
    } else {
      return res.status(404).json({
        Title: 'Success',
        Message: 'Learner not found',
        Status: 'success',
      });
    }
  } catch (error) {
    console.error('Error querying Firestore:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/api/new_lesson', async (req, res) => {
  const { lessonName, description, level, lessonNumber } = req.body;
  if (!lessonName || !description || !level || !lessonNumber) {
    return res.status(400).send('All fields are required');
  }
  try {
    const queryLesson = query(collection(db, 'lessons'), where('lessonName', '==', lessonName.toLowerCase()), where('level', '==', level));
    const querySnapshot = await getDocs(queryLesson);
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
        level: level,
        createdAt: new Date(),
        lessonNumber: lessonNumber
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