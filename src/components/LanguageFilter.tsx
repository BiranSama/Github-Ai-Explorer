'use client'
const LANGUAGES = ['All','TypeScript','JavaScript','Python','Rust','Go','Java','C++','Ruby','Swift','Kotlin']

interface Props { value?: string; onChange: (v: string|undefined) => void }
export default function LanguageFilter({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground px-1">语言</p>
      <div className="flex flex-col gap-1">
        {LANGUAGES.map(l => (
          <button
            key={l}
            onClick={() => onChange(l === 'All' ? undefined : l)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              (l === 'All' ? !value : value === l)
                ? 'bg-primary text-primary-foreground font-medium'
                : 'hover:bg-accent text-muted-foreground'
            }`}
          >
            {l === 'All' ? '🌐 全部' : l}
          </button>
        ))}
      </div>
    </div>
  )
}
