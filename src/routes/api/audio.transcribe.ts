import {
  createPartFromUri,
  createUserContent,
  GenerateContentResponse,
  GoogleGenAI,
} from '@google/genai'
import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const TRANSCRIBE_PROMPT = `
Generate audio diarization for this recording of a rpg game session. Try to deduce each speakers name. Use JSON format for the output, with the following keys: "timestamp", "speaker", "transcription". If you can infer the speaker, please do. If not, use speaker A, speaker B, etc. Always use the format mm:ss for the timestamps.
`

export const APIRoute = createAPIFileRoute('/api/audio/transcribe')({
  POST: async ({ request }) => {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    // const audioFileName = audioFile.name
    const audioFileType = audioFile.type
    // const audioFilePath = `audio/${audioFileName}`

    let response: GenerateContentResponse
    try {
      const myfile = await ai.files.upload({
        file: audioFile,
        config: { mimeType: audioFileType },
      })

      if (!myfile || !myfile.uri || !myfile.mimeType) {
        throw new Error('File upload failed')
      }

      response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        config: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
        contents: createUserContent([
          createPartFromUri(myfile.uri, myfile.mimeType),
          TRANSCRIBE_PROMPT,
        ]),
      })

      if (!response) {
        throw new Error('Transcription failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return json(
        {
          error: 'Error uploading file',
          details: error,
        },
        { status: 500 },
      )
    }

    const transcription = response.text
    console.log(transcription)

    return json({
      message: 'Audio submitted for transcription successfully!',
      // data: { transcription, audioFileName, audioFileType },
    })
  },
})
