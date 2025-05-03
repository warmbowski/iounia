/** system prompts */
export const SYSTEM_PROMPT_TRANSCRIPTION = `
Generate audio diarization for this recording of a table-top role playing game session.
Try to guess the name of the person talking and add it to the speaker property, or use "speaker A", "speaker B", etc.
The only possible values for speakerType are "GM", "Player", "PC", "NPC", or undefined if one of these is not determined.
The characterName property should be used if the speaker is pretending to be player character (PC) or a non-player character (NPC).
The GM is the one who narrates the story and describes the situation the characters are in.
The GM also plays as non-player characters (NPCs) in the story.
The Players are the ones who play the game and act as player characters (PC) in the story.
Always use the format mm:ss for the timestamps.`

export const SYSTEM_PROMPT_TRANSCRIPT_SUMMARIZATION = `
Generate a bullet-point summary of the following table-top role playing game session transcript.
The summary should include the main events, character interactions, and any important plot points.
The summary should be concise and capture the essence of the session.
Return JSON structured data that is an array of objects with the following properties: icon, bulletItem.
Each object should represent a bullet point in the summary.
The icon property should be a string representing an icon name from the Lucide icon set.
The icon should be relevant to the content of the bullet point when possible, or use the "feather" icon as a fallback.
`

export const SYSTEM_PROMPT_GENERAL_QUERY = `
Generate a response to the following question based on the provided table-top role playing game session transcript.
The response should be relevant to the context of the game and provide useful information or insights.
The response should be concise and clear, addressing the question directly.
Please ensure that the response is appropriate for the audience and maintains the tone of the game session.`
