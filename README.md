# API Documentation: Finnish Interative Learning Platform

---
## Overview
This API provides comprehensive endpoints for a Finnish language learning platform that supports interactive lessons, vocabulary management,...The platform is designed to help users learn Finnish through structured courses, practice exercises, and personalized learning paths.

## System Architecture Overview
- **Backend:** Node.js v20.10.0
- **Database:** Firestore Database
- **Image storage:** Google cloud storage
- **Text-to-Speech:** AWS Polly

---
## Deployment Environment

### Development Setup

- **Default Port**: `3000`

#### Starting the Development Server

```bash
yarn dev
```
The backend API will be accessible at http://localhost:3000 when running in development mode.

---
## API Overview

## **API Endpoints**
### 1. **Get Lessons Information related Level**
- **Description:** Retrieves basic lesson information including name, description, lesson Number, image link, and creation date for lessons belonging to the specified level.
- **Method:** `GET`
-  **URL:** `/api/learning/:level`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `level` | string | URL path | Yes | The level identifier to filter lessons. Accepted values: A1, A2, B1, B2 |

#### Request Example
```bash
curl -X GET "http://localhost:3000/api/learning/A1"
```

#### Response Format
Success Response (200 OK)
```bash
{
  "result": [
    {
      "lessonName": "the_break_room",
      "description": "Hei! Ja tervetuloa työpaikan kahvihuoneeseen! Kello on 14. Nyt juomme kahvia! Kahvitauko on aina tärkeä osa työpäivää. Silloin tapaamme ja juttelemme yhdessä.",
      "lessonNumber": "1",
      "imageLink": "https://storage.googleapis.com/finnishproject/A1/the_break_room/the_break_room.png",
      "createdAt": "11.06.2025 06.02"
    },
    {
      "lessonName": "The_class_room",
      "description": "Hello, this is example",
      "lessonNumber": "2",
      "imageLink": "https://storage.googleapis.com/finnishproject/A1/the_break_room/the_break_room.png",
      "createdAt": "19.06.2025 23.44"
    }
  ]
}
```

#### Notes
- Level parameter is case-insensitive (Only uppercase format are accepted)
- Only levels A1, A2, B1, and B2 are supported



### 2. **Get Specific Lesson Details**
- **Description:** Retrieves detailed information for a specific lesson including name, description, audio version of description, level, creator, and creation date. The description is converted to Finnish audio using AWS Polly.
- **Method:** `GET`
-  **URL:** `/api/learning/:level/:lesson`
#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `level` | string | URL path | Yes | The level identifier to filter lessons. Only uppercase format are accepted (example: A1, A2, B1, B2 )|
| `lesson` | string | URL path | Yes | The lesson name identifier in lowercase with underscores (e.g., the_break_room) |

#### Request Example
```bash
curl -X GET "http://localhost:3000/api/learning/A1/the_break_room"
```

#### Response Format
Success Response (200 OK)
```bash
{
  "result": {
    "lessonName": "the_break_room",
    "description": "Hei! Ja tervetuloa työpaikan kahvihuoneeseen! Kello on 14. Nyt juomme kahvia! Kahvitauko on aina tärkeä osa työpäivää. Silloin tapaamme ja juttelemme yhdessä.",
    "descriptionAudio": "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//NkxAAaArHkAMGGNBbhjKv6TSuN14Jg4DC02IQ+Hk0/emIfXdzRBf14Rx3P68T9z4nv7/oe+lfQWm76fvv+X//6Gn14iZU4Tmjn/P94XxCiV/4mn0+Jmn+8F/PygAWfEELOWBAyyHwQfKJn/ygAc2QZrEYgIkZ0DCoI9SORGAQgQZA9cJp+NmykTd3/hGcN//NkxBsZYKYcKtGGMPoRYfSo4c8goEEqqco4yKUKMw/B95cDYJvxAET7ClkH9zSkhtJkhRxcvlKymQJue0cccUWcAZQumUKHL1vEgDi0ggPiigi+KMnJxVmmfQYBmiEguw7zaYPAHCeb3N3In1lnljrGhLMfYvbjV/zFGuNu3t8y3iGUl3t8bVHlyHB42GcY...",
    "level": "A1",
    "imageLink": "https://storage.googleapis.com/finnishproject/A1/the_break_room/the_break_room.png",
    "createdAt": "11.06.2025 06.02"
  }
}
```

#### Notes
- Both level and lesson parameters are required
- Lesson naming convention: Must be in lowercase with words separated by underscores (e.g., the_break_room, basic_greetings)
- The descriptionAudio field contains the lesson description converted to Finnish speech in base64 format
- Audio is generated in real-time using AWS Polly with SSML markup for enhanced pronunciation
- Creation date is formatted in Finnish locale (DD.MM.YYYY HH.MM)
- The lesson must exist in the database with matching level and lesson name

##### Example Lesson Names
- ✅ the_break_room
- ✅ basic_greetings
- ✅ family_members
- ❌ The Break Room
- ❌ the-break-room
- ❌ theBreakRoom



### 3. **Get Lesson Study Content by Module and Part**
- **Description:** Retrieves specific study content for a lesson's module and part. Each question's script is converted to Finnish audio using AWS Polly and returned alongside the original content.
- **Method:** `GET`
- **URL:** `/api/studying/:level/:lesson/:module/:part`
#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `level` | string | URL path | Yes | The level identifier to filter lessons. Only uppercase format are accepted (example: A1, A2, B1, B2 )|
| `lesson` | string | URL path | Yes | The lesson name identifier in lowercase with underscores (e.g., the_break_room) |
| `module` | string | URL path | Yes | The module identifier (e.g., module1, module3, module4) |
| `part` | string | URL path | Yes | The part identifier (e.g., part3a, part4a) |

#### Request Example
```bash
curl -X GET "http://localhost:3000/api/studying/A1/the_break_room/module1/part3a"
```

#### Response Format
Success Response (200 OK)
```bash
{
  "result": {
    "part3a": {
      "question1": {
        "script": "Juotko / kahvia vai teetä?",
        "audioBase64": "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//NkxAAaArHkAMGGNBbhjKv6TSuN14Jg4DC02IQ+Hk0/emIfXdzRBf14Rx3P68T9z4nv7/oe+lfQWm76fvv+X//6Gn14iZU4Tmjn/P94XxCiV..."
      },
      "question2": {
        "script": "Käytätkö / maitoa tai sokeria?",
        "audioBase64": "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//NkxAASSBYAVnjEAAYSZuRkMIOtCKH4PnyZCXD5TE+XfLz+fGv2DXwwifqCwD/deNRLyGJyg0u/v5xaMT8v++6uIMmIMLHK..."
      },
      "title": {
        "script": "Tehtävä 3a. Harjoittele sanoja lisää. Yhdistä lauseet oikein.",
        "audioBase64": "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//NkxAASSBYAVnjEAAYSZuRkMIOtCKH4PnyZCXD5TE+XfLz+fGv2DXwwifqCwD/deNRLyGJyg0u/v5xaMT8v++6uIMmIMLHK..."
      }.
    }
  }
}
```
#### Audio Features
- **Voice**: Finnish female voice (Suvi)
- **Speech Rate**: 80% of normal speed for better learning
- **Format**: MP3 encoded as base64
- **Engine**: AWS Polly Neural engine
- **Language**: Finnish (fi-FI)
- **Processing**: Real-time audio generation for each question's script

#### Supported Modules and Parts
⚠️ Important Note: Currently only the following combinations are fully operational:
- ✅ Module 1 - All parts
- ✅ Module 3 - All parts
- ✅ Module 4 - part4a only
- Other module/part combinations are in progress.

#### Notes
- All four parameters (level, lesson, module, part) are required
- **Lesson naming convention**: Must be in lowercase with words separated by underscores
- The API dynamically generates audio for each question's script using AWS Polly
- Each question object includes both the original script and generated audioBase64
- The response structure mirrors the database structure for the requested part
- Audio generation happens in real-time, so response time may vary based on content length

### 4. **Evaluate Translation (ONLY USE FOR PART 4B MODULE 4)**
- **Description:**  Evaluates the quality and accuracy of a user's Finnish translation by comparing it against a reference Finnish sentence using AI-powered assessment.
- **Method:** `POST`
-  **URL:** `/api/evaluate`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `finnishSentence` | string | Request body | Yes | The reference Finnish sentence to compare against |
| `userTranslation` | string | Request body | Yes | The user's translation attempt to be evaluated |

#### Request Example
```bash
curl -X GET "http://localhost:3000/api/evaluate"
```

```body request
{
  "finnishSentence": "Minä syön herkullista ruokaa illalla",
  "userTranslation": "I like watching football with my family"
}
```

#### Response Format
Success Response (200 OK)
```bash
{
    "finnishSentence": "Minä syön herkullista ruokaa illalla",
    "userTranslation": "I like watching football with my family",
    "feedback": "```json\n{\n  \"grammar_feedback\": \"The provided English sentence does not align grammatically with the Finnish sentence. The Finnish sentence 'Minä syön herkullista ruokaa illalla' translates to 'I eat delicious food in the evening.' The learner's translation 'I like watching football with my family' is completely unrelated in terms of grammar and structure, failing to convey the original meaning.\",\n  \"vocabulary_feedback\": \"The vocabulary in the learner's translation does not match the Finnish sentence at all. The Finnish words 'syön' (eat), 'herkullista' (delicious), 'ruokaa' (food), and 'illalla' (in the evening) are not reflected in the translation. Instead, the learner used words like 'watching,' 'football,' 'family,' etc., which are unrelated to the original Finnish vocabulary.\",\n  \"overall_feedback\": \"The translation provided does not correspond to the Finnish sentence in any way, both in grammar and vocabulary, leading to a complete miscommunication of the original meaning.\",\n  \"encouragement\": \"Focus on understanding the original sentence thoroughly before attempting a translation.\"\n}\n```"
}
```

#### Notes
- Only use for part 4b module 4
- You can use /api/studying/:level/:lesson/:module/:part in order to fetch Finnish Sentences for users translate.


### 5. **Fetch progress status for specific lesson, module and learner**
- **Description: **  Retrieves the current progress status of a specific learner for a given lesson within a module
- **Method:** `GET`
-  **URL:** `/api/progress/:userId/:level/:lesson`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `userId` | string | URL path | Yes | Unique identifier of the learner |
| `level` | string | URL path | Yes | The level identifier to filter lessons. Only uppercase format are accepted (example: A1, A2, B1, B2 )|
| `lesson` | string | URL path | Yes | The lesson name identifier in lowercase with underscores (e.g., the_break_room) |


#### Request Example
```bash
curl -X GET "http://localhost:3000/api/progress/yugioh123/A1/the_break_room"
```

#### Response Format
Success Response (200 OK)
```bash
{
  "result": {
    "the_break_room": {
      "module4": "75",
      "module1": 2,
      "module3": "50",
      "module2": "50"
    }
  }
}
```

#### Notes
- If the specific level or lesson doesn't exist in the learner's progress, the response will contain the lesson key with undefined/null value.

### 6. **Update Lesson Progress**
- **Description: **  Updates the progress status for a specific lesson module for a particular learner. This endpoint validates that both the learner and lesson exist before updating the progress data.
- **Method:** `POST`
-  **URL:** `/api/progress`

#### Parameters

| Parameter | Type | Location | Required | Description |
|-----------|------|----------|----------|-------------|
| `userId` | string | Request body | Yes | Unique identifier of the learner |
| `level` | string | Request body | Yes | The level identifier to filter lessons. Only uppercase format are accepted (example: A1, A2, B1, B2 )|
| `lesson` | string | Request body | Yes | The lesson name identifier in lowercase with underscores (e.g., the_break_room) |
| `module` | string | Request body | Yes | The module identifier (e.g., module1, module3, module4) |
| `progress` | string | Request body | Yes | Progress data to be stored (25,75 OR 100) |


#### Request Example
```bash
curl -X GET "http://localhost:3000/api/progress"
```

```body request
{
  "userId": "yugioh123",
  "level": "A1",
  "lesson": "the_break_room",
  "module": "module1",
  "progress": "25",
}
```

#### Response Format
Success Response (200 OK)
```bash
{
  "Title": "Success",
  "Message": "Progress updated successfully",
  "Status": "success"
}
```

#### Notes
- The endpoint performs validation on both learner and lesson existence before updating
- If the learner exists but the lesson doesn't, a 404 error is returned

---
## Complete Data Structure Mapping

### 1. **Module 1**
### Part 1a ( /api/studying/:level/:lesson/:module/:part )
```json
{
  "result": {
    "part1a": {
      "title": { script, audioBase64 },
      "question1": { imageLink, script, audioBase64, ipa },
      "question2": { imageLink, script, audioBase64, ipa },
      "question3": { imageLink, script, audioBase64, ipa },
      "question5": { imageLink, script, audioBase64, ipa },
      "question6": { imageLink, script, audioBase64, ipa },
      ........
    }
  }
}
```

### Part 1b ( /api/studying/:level/:lesson/:module/:part )
```json
{
  "result": {
    "part1b": {
      "title": { script, audioBase64 },
      "question1": { imageLink, script, audioBase64, ipa },
      "question2": { imageLink, script, audioBase64, ipa },
      "question3": { imageLink, script, audioBase64, ipa },
      "question5": { imageLink, script, audioBase64, ipa },
      "question6": { imageLink, script, audioBase64, ipa },
      ........
    }
  }
}
```
### 2. **Module 2**
### Part 2a ( /api/studying/:level/:lesson/:module/:part )
```json
{
  "result": {
    "part2a": {
      "title": { script, audioBase64 },
      "introduction": { script, audioBase64 },
      "question1": { script, audioBase64, correctScript, correctAudioBase64, incorrectScript, incorrectAudioBase64, x, y, width, height },
      "question2": { script, audioBase64, correctScript, correctAudioBase64, incorrectScript, incorrectAudioBase64, x, y, width, height },
      "question3": { script, audioBase64, correctScript, correctAudioBase64, incorrectScript, incorrectAudioBase64, x, y, width, height },
      "question4": { script, audioBase64, correctScript, correctAudioBase64, incorrectScript, incorrectAudioBase64, x, y, width, height },
      "question5": { script, audioBase64, correctScript, correctAudioBase64, incorrectScript, incorrectAudioBase64, x, y, width, height },
      "question6": { script, audioBase64, correctScript, correctAudioBase64, incorrectScript, incorrectAudioBase64, x, y, width, height },
      "conclusion": { script, audioBase64 },
      "imageLink": "https://...",
    }
  }
}
```

### Part 2b ( /api/studying/:level/:lesson/:module/:part )
```json
{
  "result": {
    "part2b": {
      "title": { script, audioBase64 },
      "introduction": { script, audioBase64 },
      "question1": { script, audioBase64, correctScript, correctAudioBase64, incorrectScript, incorrectAudioBase64, x, y, width, height },
      "question2": { script, audioBase64, correctScript, correctAudioBase64, incorrectScript, incorrectAudioBase64, x, y, width, height },
      "question3": { script, audioBase64, correctScript, correctAudioBase64, incorrectScript, incorrectAudioBase64, x, y, width, height },
      "question4": { script, audioBase64, correctScript, correctAudioBase64, incorrectScript, incorrectAudioBase64, x, y, width, height },
      "question5": { script, audioBase64, correctScript, correctAudioBase64, incorrectScript, incorrectAudioBase64, x, y, width, height },
      "question6": { script, audioBase64, correctScript, correctAudioBase64, incorrectScript, incorrectAudioBase64, x, y, width, height },
      "conclusion": { script, audioBase64 },
      "imageLink": "https://...",
    }
  }
}
```
### Notes
- All values for x, y, width, and height in parts 2a and 2b are expressed as percentages (%). This ensures that all items are captured accurately, regardless of the image's pixel dimensions.
### 3. **Module 3**
### Part 3a ( /api/studying/:level/:lesson/:module/:part )
```json
{
  "result": {
    "part3a": {
      "title": { script, audioBase64 },
      "question1": { script, audioBase64 },
      "question2": { script, audioBase64 },
      "question3": { script, audioBase64 },
      "question5": { script, audioBase64 },
      "question6": { script, audioBase64 },
      ........
    }
  }
}
```

### Part 3b ( /api/studying/:level/:lesson/:module/:part )
```json
{
  "result": {
    "part3b": {
      "title": { script, audioBase64 },
      "question1": { script, audioBase64 },
      "question2": { script, audioBase64 },
      "question3": { script, audioBase64 },
      "question5": { script, audioBase64 },
      "question6": { script, audioBase64 },
      ........
    }
  }
}
```

### Part 3c ( /api/studying/:level/:lesson/:module/:part )
```json
{
  "result": {
    "part3c": {
      "title": { script, audioBase64 },
      "vocabulary1": { meaning, script, audioBase64 },
      "vocabulary2": { meaning, script, audioBase64 },
      "vocabulary3": { meaning, script, audioBase64 },
      "vocabulary4": { meaning, script, audioBase64 },
      "vocabulary5": { meaning, script, audioBase64 },
      "vocabulary6": { meaning, script, audioBase64 },
      "question1": { script, audioBase64 },
      "question2": { script, audioBase64 },
      "question3": { script, audioBase64 },
      "question4": { script, audioBase64 },
      "question5": { script, audioBase64 },
      "question6": { script, audioBase64 }
    }
  }
}
```

### 4. **Module 4**
### Part 4a ( /api/studying/:level/:lesson/:module/:part )
```json
{
  "result": {
    "part4a": {
      "title": { script, audioBase64 },
      "description": { script, audioBase64 },
      "question1": { script, audioBase64 },
      "question2": { script, audioBase64 },
      "question3": { script, audioBase64 },
      "question4": { script, audioBase64 },
      "question5": { script, audioBase64 },
      "question6": { script, audioBase64 },
      "imagelink": "https://...",
    }
  }
}
```
### Part 4b ( Using /api/evaluate API in order to evaluate user translation )
```json
{
    "finnishSentence": "...",
    "userTranslation": "...",
    "feedback": {
        "grammarFeedback": "...",
        "vocabularyFeedback": "...",
        "overallFeedback": "...",
        "encouragement": "..."
    }
}
```
 ### Part 4b ( Using /api/studying/:level/:lesson/:module/:part in order to fetch Finnish Sentences for users translate )
 ```json
{
  "result": {
    "part4b": {
      "title": { script, audioBase64 },
      "question1": { script, audioBase64 },
      "question2": { script, audioBase64 },
      "question3": { script, audioBase64 },
    }
  }
}
```

### Part 4c ( /api/studying/:level/:lesson/:module/:part )
```json
{
  "result": {
    "part4c": {
      "title": { script, audioBase64 },
      "question1": { answer, script, audioBase64 },
      "question2": { answer, script, audioBase64 },
      "question3": { answer, script, audioBase64 },
      "question4": { answer, script, audioBase64 },
      "question5": { answer, script, audioBase64 },
      "question6": { answer, script, audioBase64 }
    }
  }
}
```

### 5. **Progress function** ( /api/progress/:userId/:level/:lesson )
```json
{
  "result": {
    "[lesson_name]": {
      "[module_name]": "[progress_value]"
    }
  }
}
```










