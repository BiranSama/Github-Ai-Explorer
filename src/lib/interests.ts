export const ROLES = [
  { value: 'frontend', label: '前端工程师', emoji: '🖥️' },
  { value: 'backend', label: '后端工程师', emoji: '⚙️' },
  { value: 'fullstack', label: '全栈工程师', emoji: '🔄' },
  { value: 'mobile', label: '移动开发', emoji: '📱' },
  { value: 'devops', label: '运维/DevOps', emoji: '🛠️' },
  { value: 'data', label: '数据/AI', emoji: '🧠' },
  { value: 'student', label: '学生', emoji: '🎓' },
  { value: 'other', label: '其他', emoji: '🤷' },
] as const

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: '刚入门（0-1年）' },
  { value: 'junior', label: '初级（1-3年）' },
  { value: 'mid', label: '中级（3-5年）' },
  { value: 'senior', label: '高级（5年+）' },
] as const

export const INTEREST_AREAS = [
  { value: 'web-dev', label: 'Web 开发', emoji: '🌐', keywords: ['react', 'vue', 'angular', 'nextjs', 'next.js', 'frontend', 'ssr', 'spa', 'web'] },
  { value: 'api', label: 'API / 微服务', emoji: '🔗', keywords: ['api', 'rest', 'graphql', 'microservice', 'grpc', 'openapi', 'swagger'] },
  { value: 'cli-tools', label: '命令行工具', emoji: '💻', keywords: ['cli', 'terminal', 'shell', 'command', 'tool', 'tui'] },
  { value: 'ai-ml', label: 'AI / 机器学习', emoji: '🤖', keywords: ['ai', 'ml', 'deep-learning', 'llm', 'gpt', 'neural', 'transformer', 'model', 'nlp', 'cv'] },
  { value: 'data-engineering', label: '数据工程', emoji: '📊', keywords: ['data', 'etl', 'pipeline', 'analytics', 'warehouse', 'lake', 'spark'] },
  { value: 'devops-infra', label: '云原生 / DevOps', emoji: '☁️', keywords: ['docker', 'k8s', 'kubernetes', 'cloud', 'ci-cd', 'infrastructure', 'terraform', 'helm'] },
  { value: 'mobile-dev', label: '移动开发', emoji: '📲', keywords: ['ios', 'android', 'react-native', 'flutter', 'swift', 'kotlin', 'mobile'] },
  { value: 'game-dev', label: '游戏开发', emoji: '🎮', keywords: ['game', 'unity', 'unreal', 'godot', 'engine', '3d', '2d'] },
  { value: 'security', label: '安全', emoji: '🔒', keywords: ['security', 'auth', 'encryption', 'crypto', 'vulnerability', 'pentest'] },
  { value: 'database', label: '数据库', emoji: '🗄️', keywords: ['database', 'sql', 'nosql', 'redis', 'postgres', 'mysql', 'mongodb', 'orm'] },
  { value: 'embedded', label: '嵌入式 / IoT', emoji: '🔌', keywords: ['embedded', 'iot', 'hardware', 'firmware', 'raspberry', 'arduino'] },
  { value: 'oss', label: '开源贡献', emoji: '❤️', keywords: ['open-source', 'contributing', 'community', 'hacktoberfest'] },
] as const

export const TECH_STACK_OPTIONS = [
  'react', 'vue', 'angular', 'svelte',
  'node', 'python', 'go', 'rust',
  'java', 'swift', 'kotlin', 'typescript',
  'docker', 'kubernetes',
] as const

export const GOALS = [
  { value: 'learn-new-framework', label: '学习新框架/技术', emoji: '📚' },
  { value: 'find-tools', label: '找好用的工具库', emoji: '🔧' },
  { value: 'contribute-oss', label: '参与开源贡献', emoji: '🤝' },
  { value: 'read-source-code', label: '阅读优秀源码', emoji: '📖' },
  { value: 'career-growth', label: '职业发展提升', emoji: '🚀' },
  { value: 'stay-updated', label: '跟踪技术趋势', emoji: '📡' },
] as const

export const TECH_RELATED: Record<string, string[]> = {
  react: ['next.js', 'remix', 'gatsby', 'vite', 'tailwindcss', 'redux', 'zustand'],
  vue: ['nuxt', 'vite', 'pinia', 'vueuse', 'element-plus'],
  angular: ['ngrx', 'rxjs', 'material'],
  svelte: ['sveltekit', 'tailwindcss'],
  node: ['express', 'fastify', 'prisma', 'typeorm', 'nest'],
  python: ['django', 'flask', 'fastapi', 'pytorch', 'numpy', 'pandas'],
  go: ['gin', 'echo', 'fiber', 'grpc'],
  rust: ['tokio', 'actix', 'wasm', 'bevy'],
  java: ['spring', 'hibernate', 'gradle'],
  swift: ['swiftui', 'vapor', 'alamofire'],
  kotlin: ['ktor', 'compose', 'coil'],
  typescript: ['deno', 'bun', 'zod', 'trpc'],
  docker: ['kubernetes', 'helm', 'terraform', 'compose'],
  kubernetes: ['helm', 'istio', 'prometheus', 'argocd'],
}

export function matchInterests(projectDescription: string | null, projectTopics: string[], userInterests: string[]): string[] {
  if (!userInterests.length) return []
  const matched: string[] = []
  const text = `${projectDescription || ''} ${projectTopics.join(' ')}`.toLowerCase()
  for (const interest of userInterests) {
    const area = INTEREST_AREAS.find(a => a.value === interest)
    if (!area) continue
    if (area.keywords.some(kw => text.includes(kw))) {
      matched.push(interest)
    }
  }
  return matched
}

export function getRelatedTech(userTech: string[]): string[] {
  const related = new Set<string>()
  for (const tech of userTech) {
    const list = TECH_RELATED[tech]
    if (list) {
      for (const item of list) related.add(item)
    }
  }
  return Array.from(related)
}

export type Role = typeof ROLES[number]['value']
export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number]['value']
export type InterestArea = typeof INTEREST_AREAS[number]['value']
export type TechStackOption = typeof TECH_STACK_OPTIONS[number]
export type Goal = typeof GOALS[number]['value']

export const VALID_ROLES = ROLES.map(r => r.value)
export const VALID_EXPERIENCE_LEVELS = EXPERIENCE_LEVELS.map(e => e.value)
export const VALID_INTERESTS = INTEREST_AREAS.map(i => i.value)
export const VALID_GOALS = GOALS.map(g => g.value)