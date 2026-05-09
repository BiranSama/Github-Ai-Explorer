const PROVIDER = process.env.LLM_PROVIDER || 'openai'
const API_KEY = process.env.LLM_API_KEY || ''
const MODEL = process.env.LLM_MODEL || 'gpt-4o-mini'
const BASE_URL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1'

export interface LLMProjectContext {
  name: string
  description: string | null
  primaryLanguage: string | null
  stars: number
  lastPushed: Date
}

const SYSTEM = '你是一个专业的开源项目分析师。'

const USER_PROMPT = (p: LLMProjectContext) => `项目信息：
- 名称: ${p.name}
- 原始描述: ${p.description || '(无)'}
- 主语言: ${p.primaryLanguage || '(未知)'}
- Star 数: ${p.stars}
- 最后更新时间: ${p.lastPushed.toLocaleDateString('zh-CN')}

请用简洁的中文（100-150字）解释：
1. 这个项目是做什么的
2. 它的主要特点或优势是什么
3. 适合什么场景或什么类型的开发者

要求：通俗易懂，非技术人员也能理解大概。不要照搬原始描述。`

export async function generateSummary(project: LLMProjectContext): Promise<string> {
  if (PROVIDER === 'anthropic') {
    const res = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: SYSTEM,
        messages: [{ role: 'user', content: USER_PROMPT(project) }],
      }),
    })
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`)
    const data = await res.json() as { content: Array<{ type: string; text: string }> }
    return data.content.find(c => c.type === 'text')?.text || ''
  } else {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: USER_PROMPT(project) },
        ],
        max_tokens: 400,
      }),
    })
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`)
    const data = await res.json() as { choices: Array<{ message: { content: string } }> }
    return data.choices[0]?.message?.content || ''
  }
}
