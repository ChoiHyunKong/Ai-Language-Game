/**
 * 언어 관리자 - 다국어 지원
 */
export class LanguageManager {
    constructor(language = 'ko') {
        this.language = language;
        this.supportedLanguages = ['ko', 'en', 'jp'];
    }

    setLanguage(lang) {
        if (this.supportedLanguages.includes(lang)) {
            this.language = lang;
            return true;
        }
        return false;
    }

    getLanguage() {
        return this.language;
    }

    getWordColumn() {
        return `word_${this.language}`;
    }

    getMeaningColumn() {
        return `meaning_${this.language}`;
    }

    getSentenceColumn() {
        return `sentence_${this.language}`;
    }

    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    addLanguage(langCode) {
        if (!this.supportedLanguages.includes(langCode)) {
            this.supportedLanguages.push(langCode);
        }
    }
}
