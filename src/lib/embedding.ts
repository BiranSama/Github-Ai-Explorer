import { OpenAI } from 'openai'

const client = new OpenAI({
  baseURL: process.env.EMBEDDING_BASE_URL || process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.EMBEDDING_API_KEY || process.env.LLM_API_KEY || '',
})

const MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await client.embeddings.create({
    model: MODEL,
    input: text,
  })
  return response.data[0].embedding
}

export function buildEmbeddingText(project: {
  name: string
  description: string | null
  primaryLanguage: string | null
}): string {
  const parts = [project.name]
  if (project.description) parts.push(project.description)
  if (project.primaryLanguage) parts.push(`Language: ${project.primaryLanguage}`)
  return parts.join('. ')
}
