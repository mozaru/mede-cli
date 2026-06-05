export const languages = {
  'pt-BR': 'Português',
  'en': 'English'
};

export const defaultLang = 'pt-BR';

export const ui = {
  'pt-BR': {
    'nav.home': 'Home',
    'nav.methodology': 'Metodologia',
    'nav.cli': 'Ferramenta CLI',
    'nav.quickstart': 'Guia Rápido',
    'footer.description': 'Evolução de documentação de engenharia por ciclos causais supervisionados, assistidos por LLM, com revisão humana obrigatória.',
    'footer.links': 'Links Úteis',
    'footer.contact': 'Contato',
    'footer.rights': 'Todos os direitos reservados.',
  },
  'en': {
    'nav.home': 'Home',
    'nav.methodology': 'Methodology',
    'nav.cli': 'CLI Tool',
    'nav.quickstart': 'Quick Start',
    'footer.description': 'Engineering documentation evolution via supervised causal cycles, assisted by LLMs, with mandatory human review.',
    'footer.links': 'Useful Links',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
  }
} as const;

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function localizePath(path: string, lang: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) {
    return cleanPath;
  }
  return `/${lang}${cleanPath === '/' ? '' : cleanPath}`;
}
