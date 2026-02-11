'use client'

const TITLE_MAX = 60
const TITLE_RECOMMENDED = '50–60'
const DESC_MAX = 160
const DESC_RECOMMENDED = '150–160'

interface MetaLengthHintProps {
  value: string
  type: 'title' | 'description'
}

export function MetaLengthHint({ value, type }: MetaLengthHintProps) {
  const len = value.length
  const isTitle = type === 'title'
  const max = isTitle ? TITLE_MAX : DESC_MAX
  const recommended = isTitle ? TITLE_RECOMMENDED : DESC_RECOMMENDED
  const over = len > max
  return (
    <div className="flex items-center justify-between gap-2 mt-1">
      <span className={`text-xs ${over ? 'text-amber-600' : 'text-gray-500'}`}>
        {len}/{max} ký tự
        {over && (
          <span className="ml-1">
            — Nên giữ dưới {max} ký tự để hiển thị đầy đủ trên Google.
          </span>
        )}
      </span>
      {!over && len > 0 && (
        <span className="text-xs text-gray-400">Khuyến nghị: {recommended}</span>
      )}
    </div>
  )
}
