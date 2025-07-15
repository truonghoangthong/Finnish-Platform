import {SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { pollyClient } from '../config/aws-config.js';
const command = async (script) => {
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
      const audioBase64 = audioBuffer.toString('base64');
      return audioBase64;
}

export { command };