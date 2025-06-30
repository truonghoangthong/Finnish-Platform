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
- **Description:** Retrieves basic lesson information including name, description, creator, and creation date for lessons belonging to the specified level.
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
      "creator": "Bi",
      "createdAt": "11.06.2025 06.02"
    },
    {
      "lessonName": "The_class_room",
      "description": "Hello, this is example",
      "creator": "Thong",
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
    "creator": "Bi",
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
      }
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

---
## Complete Data Structure Mapping

### 1. **Module 1**
### Part 1a
```json
{
  "result": {
    "part1a": {
      "question1": { imageLink, script, audioBase64 },
      "question2": { imageLink, script, audioBase64 },
      "question3": { imageLink, script, audioBase64 },
      "question5": { imageLink, script, audioBase64 },
      "question6": { imageLink, script, audioBase64 },
      ........
    }
  }
}
```

### Part 1b
```json
{
  "result": {
    "part1b": {
      "question1": { imageLink, script, audioBase64 },
      "question2": { imageLink, script, audioBase64 },
      "question3": { imageLink, script, audioBase64 },
      "question5": { imageLink, script, audioBase64 },
      "question6": { imageLink, script, audioBase64 },
      ........
    }
  }
}
```
### 2. **Module 2**
### In Progress ###

### 3. **Module 3**
### Part 3a
```json
{
  "result": {
    "part3a": {
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

### Part 3b
```json
{
  "result": {
    "part3b": {
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

### Part 3c
```json
{
  "result": {
    "part3c": {
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
### Part 4a
```json
{
  "result": {
    "part4a": {
      "description": { script, audioBase64 },
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
### Part 4b ( Using /api/evaluate API in order to evaluate user translation and Using /api/studying/:level/:lesson/:module/:part in order to fetch Finnish Sentences for users translate)
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
### Part 4c
```json
{
  "result": {
    "part4c": {
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









