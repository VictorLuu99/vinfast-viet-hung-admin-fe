/**
 * SEO Score Engine (Rank Math style) - types and analysis for news/product content.
 * Output: overallScore, seoAnalysis, readability, suggestions.
 */

export type ContentType = 'news' | 'product'

export interface SeoAnalysis {
  focusKeyword: string
  focusKeywordSuggested: boolean
  titleHasKeyword: boolean
  metaTitleHasKeyword: boolean
  metaDescriptionHasKeyword: boolean
  keywordInFirst10Percent: boolean
  headingStructureValid: boolean
  hasH1: boolean
  headingHierarchyOk: boolean
  keywordDensityPercent: number
  keywordDensityRecommended: string
  imagesWithAlt: number
  imagesWithoutAlt: number
  featuredImagePresent: boolean
}

export interface ReadabilityResult {
  paragraphLengthOk: boolean
  longParagraphCount: number
  transitionWordRatio: number
  transitionWordRecommendation: string
  passiveVoiceRatio: number
  passiveVoiceRecommendation: string
}

export interface SeoReport {
  overallScore: number
  seoAnalysis: SeoAnalysis
  readability: ReadabilityResult
  suggestions: string[]
}

export interface SeoScoreInput {
  h1Title: string
  contentHtml: string
  metaTitle: string
  metaDescription: string
  keywords: string
  focusKeyword: string
  featuredImageUrl?: string
  type: ContentType
}

const VIETNAMESE_MAP: Record<string, string> = {
  à: 'a', á: 'a', ạ: 'a', ả: 'a', ã: 'a', â: 'a', ầ: 'a', ấ: 'a', ậ: 'a', ẩ: 'a', ẫ: 'a',
  ă: 'a', ằ: 'a', ắ: 'a', ặ: 'a', ẳ: 'a', ẵ: 'a', è: 'e', é: 'e', ẹ: 'e', ẻ: 'e', ẽ: 'e',
  ê: 'e', ề: 'e', ế: 'e', ệ: 'e', ể: 'e', ễ: 'e', ì: 'i', í: 'i', ị: 'i', ỉ: 'i', ĩ: 'i',
  ò: 'o', ó: 'o', ọ: 'o', ỏ: 'o', õ: 'o', ô: 'o', ồ: 'o', ố: 'o', ộ: 'o', ổ: 'o', ỗ: 'o',
  ơ: 'o', ờ: 'o', ớ: 'o', ợ: 'o', ở: 'o', ỡ: 'o', ù: 'u', ú: 'u', ụ: 'u', ủ: 'u', ũ: 'u',
  ư: 'u', ừ: 'u', ứ: 'u', ự: 'u', ử: 'u', ữ: 'u', ỳ: 'y', ý: 'y', ỵ: 'y', ỷ: 'y', ỹ: 'y', đ: 'd'
}

function normalizeVietnamese(s: string): string {
  return s
    .toLowerCase()
    .split('')
    .map((c) => VIETNAMESE_MAP[c] ?? c)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function getParagraphsFromHtml(html: string): string[] {
  if (!html) return []
  const parts = html.split(/<\/p>|<p[^>]*>|\n\n+/i).map((p) => stripHtml(p)).filter((p) => p.length > 0)
  return parts
}

function getSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function parseHeadings(html: string): { level: number; text: string }[] {
  const re = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi
  const out: { level: number; text: string }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    out.push({ level: parseInt(m[1], 10), text: stripHtml(m[2]) })
  }
  return out
}

function countKeywordOccurrences(text: string, keyword: string): number {
  if (!keyword) return 0
  const normText = normalizeVietnamese(text)
  const normKw = normalizeVietnamese(keyword)
  if (!normKw) return 0
  const re = new RegExp(normKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  const matches = normText.match(re)
  return matches ? matches.length : 0
}

function keywordInFirst10Percent(fullText: string, keyword: string): boolean {
  if (!keyword || !fullText) return false
  const len = Math.max(1, Math.floor(fullText.length * 0.1))
  const firstPart = fullText.slice(0, len)
  return countKeywordOccurrences(firstPart, keyword) > 0
}

function getImagesInHtml(html: string): { hasAlt: boolean }[] {
  const re = /<img[^>]+>/gi
  const out: { hasAlt: boolean }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const altMatch = /alt\s*=\s*["']([^"']*)["']/i.exec(m[0])
    const hasAlt = !!(altMatch && altMatch[1].trim())
    out.push({ hasAlt })
  }
  return out
}

const TRANSITION_WORDS_VI = [
  'tuy nhiên', 'ngoài ra', 'mặt khác', 'do đó', 'vì vậy', 'như vậy', 'đồng thời',
  'trước tiên', 'tiếp theo', 'cuối cùng', 'nói cách khác', 'cụ thể là', 'ví dụ',
  'tức là', 'thêm vào đó', 'hơn nữa', 'quan trọng hơn', 'trên thực tế', 'nhìn chung'
]

function countTransitionSentences(sentences: string[]): number {
  const normList = TRANSITION_WORDS_VI.map(normalizeVietnamese)
  return sentences.filter((s) => {
    const n = normalizeVietnamese(s)
    return normList.some((tw) => n.includes(tw))
  }).length
}

function countPassiveSentences(sentences: string[]): number {
  const passiveRe = /^\s*(được|bị)\s+\S+/i
  return sentences.filter((s) => passiveRe.test(s.trim())).length
}

const DENSITY_MIN = 0.5
const DENSITY_MAX = 2.5

export function seoScoreEngine(input: SeoScoreInput): SeoReport {
  const {
    h1Title,
    contentHtml,
    metaTitle,
    metaDescription,
    keywords,
    focusKeyword: rawFocus,
    featuredImageUrl,
    type
  } = input

  const focusKeyword = rawFocus.trim() || (() => {
    const firstKw = keywords.split(',')[0]?.trim()
    return firstKw || h1Title.split(/\s+/).slice(0, 4).join(' ') || ''
  })()

  const focusSuggested = !rawFocus.trim()

  const plainText = stripHtml(contentHtml)
  const fullTextForDensity = (plainText + ' ' + h1Title).trim()
  const charCount = fullTextForDensity.length
  const kwCount = countKeywordOccurrences(fullTextForDensity, focusKeyword)
  const kwLen = focusKeyword.split(/\s+/).filter(Boolean).length
  const densityPercent = charCount > 0 && focusKeyword
    ? (kwCount * Math.max(1, kwLen * 5) / charCount) * 100
    : 0

  const titleHasKeyword = focusKeyword ? countKeywordOccurrences(h1Title, focusKeyword) > 0 : false
  const metaTitleHasKeyword = focusKeyword ? countKeywordOccurrences(metaTitle, focusKeyword) > 0 : false
  const metaDescHasKeyword = focusKeyword ? countKeywordOccurrences(metaDescription, focusKeyword) > 0 : false
  const inFirst10 = focusKeyword ? keywordInFirst10Percent(plainText, focusKeyword) : false

  const headings = parseHeadings(contentHtml)
  const hasH1 = type === 'product' ? true : headings.some((h) => h.level === 1) || !!h1Title
  let headingHierarchyOk = true
  let prevLevel = 0
  for (const h of headings) {
    if (h.level > prevLevel + 1) headingHierarchyOk = false
    prevLevel = h.level
  }

  const images = getImagesInHtml(contentHtml)
  const imagesWithAlt = images.filter((i) => i.hasAlt).length
  const imagesWithoutAlt = images.filter((i) => !i.hasAlt).length
  const featuredImagePresent = !!featuredImageUrl

  const paragraphs = getParagraphsFromHtml(contentHtml)
  let longParagraphCount = 0
  for (const p of paragraphs) {
    const sentences = getSentences(p)
    if (sentences.length > 3) longParagraphCount++
  }
  const paragraphLengthOk = longParagraphCount === 0

  const allSentences = getSentences(plainText)
  const transitionCount = countTransitionSentences(allSentences)
  const transitionRatio = allSentences.length > 0 ? transitionCount / allSentences.length : 0
  const passiveCount = countPassiveSentences(allSentences)
  const passiveRatio = allSentences.length > 0 ? passiveCount / allSentences.length : 0

  const seoAnalysis: SeoAnalysis = {
    focusKeyword,
    focusKeywordSuggested: focusSuggested,
    titleHasKeyword,
    metaTitleHasKeyword,
    metaDescriptionHasKeyword: metaDescHasKeyword,
    keywordInFirst10Percent: inFirst10,
    headingStructureValid: hasH1 && headingHierarchyOk,
    hasH1,
    headingHierarchyOk,
    keywordDensityPercent: Math.round(densityPercent * 10) / 10,
    keywordDensityRecommended: `${DENSITY_MIN}–${DENSITY_MAX}%`,
    imagesWithAlt,
    imagesWithoutAlt,
    featuredImagePresent
  }

  const readability: ReadabilityResult = {
    paragraphLengthOk,
    longParagraphCount,
    transitionWordRatio: Math.round(transitionRatio * 100),
    transitionWordRecommendation: transitionRatio < 0.2 ? 'Nên dùng thêm từ nối (tuy nhiên, ngoài ra, do đó...)' : 'Đạt',
    passiveVoiceRatio: Math.round(passiveRatio * 100),
    passiveVoiceRecommendation: passiveRatio > 0.25 ? 'Nên giảm câu bị động (được/bị)' : 'Đạt'
  }

  const suggestions: string[] = []
  if (focusSuggested && (h1Title || keywords)) {
    suggestions.push('Nhập "Từ khóa trọng tâm" để chấm điểm chính xác hơn (hoặc dùng từ khóa đầu tiên).')
  }
  if (focusKeyword && !titleHasKeyword) {
    suggestions.push('Thêm từ khóa trọng tâm vào tiêu đề (H1).')
  }
  if (focusKeyword && !metaTitleHasKeyword && metaTitle) {
    suggestions.push('Đặt từ khóa trọng tâm vào Tiêu đề SEO.')
  }
  if (focusKeyword && !metaDescHasKeyword && metaDescription) {
    suggestions.push('Đặt từ khóa trọng tâm vào Mô tả SEO.')
  }
  if (focusKeyword && !inFirst10 && plainText.length > 50) {
    suggestions.push('Thêm từ khóa trọng tâm vào 10% đầu nội dung.')
  }
  if (!headingHierarchyOk) {
    suggestions.push('Chỉnh cấu trúc heading: không nhảy cấp (ví dụ H2 rồi mới tới H3).')
  }
  if (focusKeyword && (densityPercent < DENSITY_MIN || densityPercent > DENSITY_MAX)) {
    suggestions.push(`Mật độ từ khóa hiện tại ${seoAnalysis.keywordDensityPercent}%. Nên trong khoảng ${seoAnalysis.keywordDensityRecommended}.`)
  }
  if (imagesWithoutAlt > 0) {
    suggestions.push(`Thêm thuộc tính alt cho ${imagesWithoutAlt} ảnh trong nội dung.`)
  }
  if (type === 'news' && !featuredImagePresent) {
    suggestions.push('Nên thêm ảnh đại diện cho bài viết.')
  }
  if (!paragraphLengthOk) {
    suggestions.push(`Rút ngắn ${longParagraphCount} đoạn có trên 3 câu (mỗi đoạn nên dưới 3 câu).`)
  }
  if (readability.transitionWordRatio < 20 && allSentences.length >= 3) {
    suggestions.push(readability.transitionWordRecommendation)
  }
  if (readability.passiveVoiceRatio > 25) {
    suggestions.push(readability.passiveVoiceRecommendation)
  }

  const uniqueSuggestions = Array.from(new Set(suggestions)).slice(0, 5)

  let score = 0
  const weights = {
    titleMeta: 25,
    keywordFirst10: 15,
    heading: 10,
    density: 15,
    images: 10,
    readability: 25
  }
  if (focusKeyword) {
    if (titleHasKeyword) score += 10
    if (metaTitleHasKeyword) score += 8
    if (metaDescHasKeyword) score += 7
    if (inFirst10) score += weights.keywordFirst10
    const densityOk = densityPercent >= DENSITY_MIN && densityPercent <= DENSITY_MAX
    score += headingHierarchyOk && hasH1 ? weights.heading : 0
    score += densityOk ? weights.density : (densityPercent > 0 ? weights.density / 2 : 0)
  } else {
    score += (titleHasKeyword ? 10 : 0) + (metaTitleHasKeyword ? 8 : 0) + (metaDescHasKeyword ? 7 : 0)
    score += hasH1 && headingHierarchyOk ? weights.heading : 0
  }
  const imageScore = images.length === 0 ? 10 : (imagesWithAlt / images.length) * 10
  score += type === 'news' && featuredImagePresent ? 5 : imageScore * 0.5
  if (type === 'news' && !featuredImagePresent) score += 0
  else if (images.length > 0) score += imageScore
  score += paragraphLengthOk ? 10 : 5
  score += transitionRatio >= 0.15 ? 8 : 4
  score += passiveRatio <= 0.25 ? 7 : 3

  const overallScore = Math.min(100, Math.round(score))

  return {
    overallScore,
    seoAnalysis,
    readability,
    suggestions: uniqueSuggestions
  }
}
