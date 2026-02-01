//node --env-file=.env api.ts

import express from 'express'
const app = express()
const port = 3000

import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';
import { Readable } from 'stream';

const elevenlabs = new ElevenLabsClient();
const voice_id = 'JBFqnCBsd6RMkjVDRZzb'

import cors from "cors";
app.use(cors())
app.set('case sensitive routing', true);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/speak/:person/:text', async (req, res) => {
  const audio = await elevenlabs.textToSpeech.convert(req.params.person.toString(), {
    text: req.params.text.toString().replaceAll(/&/g, " "),
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

  const reader = audio.getReader();
  const stream = new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(value);
      }
    },
  });

  await play(stream);
  res.send('Playing Audio')
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`)
})
