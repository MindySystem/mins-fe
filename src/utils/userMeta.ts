import type { SkillLevel, User } from '@/store/useAppStore'

export const GENDER_LABELS: Record<NonNullable<User['gender']>, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Mới chơi',
  casual: 'Cơ bản',
  intermediate: 'Trung bình',
  advanced: 'Khá / Giỏi',
}

export const SKILL_LEVEL_OPTIONS: Array<{ value: SkillLevel; label: string }> = [
  { value: 'beginner', label: SKILL_LEVEL_LABELS.beginner },
  { value: 'casual', label: SKILL_LEVEL_LABELS.casual },
  { value: 'intermediate', label: SKILL_LEVEL_LABELS.intermediate },
  { value: 'advanced', label: SKILL_LEVEL_LABELS.advanced },
]

export function genderLabel(gender?: User['gender']): string {
  return GENDER_LABELS[gender || 'male']
}

export function skillLevelLabel(skillLevel?: SkillLevel): string {
  return SKILL_LEVEL_LABELS[skillLevel || 'beginner']
}
