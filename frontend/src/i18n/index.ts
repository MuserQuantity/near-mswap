import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en_translate from '../locales/en.json'
import zh_translation from '../locales/zh.json'

i18n.use(initReactI18next).init({
  debug: false,
  // fallbackLng: 'zh_CN',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: en_translate,
    },
    zh_CN: {
      translation: zh_translation,
    },
  },
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
})
export default i18n
