'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  seoScoreEngine,
  type ContentType,
  type SeoReport
} from '@/lib/seo-score'
import { Check, X, AlertCircle } from 'lucide-react'

export interface SeoScoreFormValues {
  h1Title: string
  contentHtml: string
  metaTitle: string
  metaDescription: string
  keywords: string
  featuredImageUrl?: string
}

interface SeoScorePanelProps {
  type: ContentType
  formValues: SeoScoreFormValues
  focusKeyword: string
  onFocusKeywordChange: (value: string) => void
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600'
  const stroke = score >= 70 ? 'stroke-green-600' : score >= 40 ? 'stroke-amber-600' : 'stroke-red-600'
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="36" fill="none" strokeWidth="8" className="stroke-gray-200" />
        <circle
          cx="48"
          cy="48"
          r="36"
          fill="none"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-500 ${stroke}`}
        />
      </svg>
      <span className={`absolute text-xl font-bold ${color}`}>{score}</span>
    </div>
  )
}

function ChecklistItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <Check className="h-4 w-4 shrink-0 text-green-600" />
      ) : (
        <X className="h-4 w-4 shrink-0 text-red-500" />
      )}
      <span className={ok ? 'text-gray-700' : 'text-gray-600'}>{label}</span>
    </div>
  )
}

export function SeoScorePanel({
  type,
  formValues,
  focusKeyword,
  onFocusKeywordChange
}: SeoScorePanelProps) {
  const report = React.useMemo((): SeoReport | null => {
    return seoScoreEngine({
      h1Title: formValues.h1Title,
      contentHtml: formValues.contentHtml,
      metaTitle: formValues.metaTitle,
      metaDescription: formValues.metaDescription,
      keywords: formValues.keywords,
      focusKeyword,
      featuredImageUrl: formValues.featuredImageUrl,
      type
    })
  }, [
    formValues.h1Title,
    formValues.contentHtml,
    formValues.metaTitle,
    formValues.metaDescription,
    formValues.keywords,
    formValues.featuredImageUrl,
    focusKeyword,
    type
  ])

  if (!report) return null

  const { overallScore, seoAnalysis, readability, suggestions } = report

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Chấm điểm SEO
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seo-focus-keyword">Từ khóa trọng tâm</Label>
          <Input
            id="seo-focus-keyword"
            value={focusKeyword}
            onChange={(e) => onFocusKeywordChange(e.target.value)}
            placeholder="VD: xe máy điện VinFast"
            className="text-sm"
          />
          {seoAnalysis.focusKeywordSuggested && seoAnalysis.focusKeyword && (
            <p className="text-xs text-gray-500">
              Đang dùng gợi ý: &quot;{seoAnalysis.focusKeyword}&quot;
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ScoreRing score={overallScore} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Điểm tổng: {overallScore}/100</p>
            <Progress value={overallScore} className="mt-1 h-2" />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            SEO Analysis
          </p>
          <div className="space-y-1.5">
            <ChecklistItem
              ok={seoAnalysis.titleHasKeyword || !seoAnalysis.focusKeyword}
              label="Từ khóa trong tiêu đề (H1)"
            />
            <ChecklistItem
              ok={seoAnalysis.metaTitleHasKeyword || !seoAnalysis.focusKeyword}
              label="Từ khóa trong Tiêu đề SEO"
            />
            <ChecklistItem
              ok={seoAnalysis.metaDescriptionHasKeyword || !seoAnalysis.focusKeyword}
              label="Từ khóa trong Mô tả SEO"
            />
            <ChecklistItem ok={seoAnalysis.keywordInFirst10Percent || !seoAnalysis.focusKeyword} label="Từ khóa trong 10% đầu nội dung" />
            <ChecklistItem ok={seoAnalysis.headingStructureValid} label="Cấu trúc heading (H2/H3) hợp lệ" />
            <div className="flex items-center gap-2 text-sm">
              <ChecklistItem
                ok={seoAnalysis.imagesWithoutAlt === 0}
                label={
                  seoAnalysis.imagesWithAlt + seoAnalysis.imagesWithoutAlt === 0
                    ? 'Không có ảnh trong nội dung (hoặc đều có alt)'
                    : `Ảnh có alt: ${seoAnalysis.imagesWithAlt}/${seoAnalysis.imagesWithAlt + seoAnalysis.imagesWithoutAlt}`
                }
              />
            </div>
            <div className="text-xs text-gray-500 pl-6">
              Mật độ từ khóa: {seoAnalysis.keywordDensityPercent}% (khuyến nghị {seoAnalysis.keywordDensityRecommended})
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Readability
          </p>
          <div className="space-y-1.5">
            <ChecklistItem ok={readability.paragraphLengthOk} label={`Đoạn ngắn (< 3 câu): ${readability.longParagraphCount} đoạn dài`} />
            <p className="text-xs text-gray-500 pl-6">
              Từ nối: {readability.transitionWordRatio}% câu. {readability.transitionWordRecommendation}
            </p>
            <p className="text-xs text-gray-500 pl-6">
              Câu bị động: {readability.passiveVoiceRatio}%. {readability.passiveVoiceRecommendation}
            </p>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Gợi ý cải thiện
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
