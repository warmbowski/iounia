import { ensureServerEnironmentVariable } from './helpers/utililties'

export const MAX_RECORDING_DURATION_SEC = 60 * 60 * 0.5 // 30 minutes
export const MAX_ACTIVE_MEMBERS_PER_CAMPAIGN_COUNT = 10
export const MAX_CAMPAIGNS_PER_USER_COUNT = 3
export const MIN_TEXT_LENGTH_FOR_EMBEDDING_GENERATION = 25
export const TIME_SPAN_CONTEXT_LENGTH_MS = 1000 * 60 * 5 // 5 minutes
export const AUDIO_CHUNK_DURATION_SEC = 15 * 60 // 15 minutes

export const CONVEX_SITE_URL = ensureServerEnironmentVariable('CONVEX_SITE_URL')
export const CONVEX_CLOUD_URL =
  ensureServerEnironmentVariable('CONVEX_CLOUD_URL')
export const WEBHOOK_URL = `${CONVEX_SITE_URL}/webhooks/assemblyai`
export const WEBHOOK_AUTH_HEADER_NAME = 'x-assemblyai-256'
export const WEBHOOK_AUTH_HEADER_VALUE =
  ensureServerEnironmentVariable('WEBHOOK_SECRET')

/** system prompts */

export const SYSTEM_PROMPT_TRANSCRIPTION = (
  startTimestamp: string,
  endTimestamp: string,
) => `
Generate audio diarization for this recording of a table-top role playing game session using 
the format hh:mm:ss for the timestamps.
Transcribe the audio from ${startTimestamp} to ${endTimestamp}.
Try to guess the name of the person talking and add it to the speaker property, or use "speaker A", "speaker B", etc.
The only possible values for speakerType are "GM", "Player", "PC", "NPC", or undefined if one of these is not determined.
The characterName property should be used if the speaker is pretending to be player character (PC) or a non-player character (NPC).
The GM is the one who narrates the story and describes the situation the characters are in.
The GM also plays as non-player characters (NPCs) in the story.
The Players are the ones who play the game and act as player characters (PC) in the story.`

export const SYSTEM_PROMPT_TRANSCRIPT_SUMMARIZATION = `
Generate a bullet-point summary of the following table-top role playing game session transcript.
The summary should include the main events, character interactions, and any important plot points.
The summary should be concise and capture the essence of the session.
Return JSON structured data that is an array of objects with the following properties: icon, bulletItem.
Each object should represent a bullet point in the summary.
The icon property should be a string representing an icon name from the Lucide icon set.
The icon should be relevant to the content of the bullet point when possible, or use the "feather" icon as a fallback.
`

export const SYSTEM_PROMPT_SHORT_SUMMARIZATION = `
Generate a short summary paragraph of no more than 2 sentences for the following table-top role playing game summary.
Return JSON structured data that is an array of objects with the following properties: text.
`

export const SYSTEM_PROMPT_GENERAL_QUERY = `
Generate a response to the following question based on the provided table-top role playing game session transcript.
The response should be relevant to the context of the game and provide useful information or insights.
The response should be concise and clear, addressing the question directly.
Please ensure that the response is appropriate for the audience and maintains the tone of the game session.`

export const GENERATE_CAMPAIGN_IMAGE_PROMPT = `
Generate an image of an old fashioned hand drawn map reminiscent of the fifteenth century. 
Integrate stock dungeons and dragons type of locations and monsters. Make sure the image is
in the style of a hand drawn map, with a parchment background and a vintage look.
The map should include various terrains such as mountains, forests, rivers, and towns.
`
