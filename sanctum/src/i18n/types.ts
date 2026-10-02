export type Lang = 'zh-Hant' | 'zh-Hans' | 'en' | 'ja'
export type ThemeChoice = 'system' | 'dark' | 'light'

const LANGS: Lang[] = ['zh-Hant', 'zh-Hans', 'en', 'ja']

export function isLang(value: string): value is Lang {
  return LANGS.includes(value as Lang)
}
