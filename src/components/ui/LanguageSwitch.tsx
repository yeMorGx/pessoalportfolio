import type { Locale } from "@/lib/i18n";

type LanguageSwitchProps = {
  locale: Locale;
  englishHref: string;
  portugueseHref: string;
};

export function LanguageSwitch({ locale, englishHref, portugueseHref }: LanguageSwitchProps) {
  return (
    <div className="flex h-8 items-center border border-white/15 bg-ink/70 px-1 font-mono text-[0.58rem] uppercase" aria-label="Language / Idioma">
      <a href={englishHref} hrefLang="en" aria-current={locale === "en" ? "page" : undefined} className={`flex h-6 items-center px-2 transition-colors focus:outline-none focus-visible:text-mint ${locale === "en" ? "text-mint" : "text-steel hover:text-ceramic"}`}>
        EN
      </a>
      <span className="text-white/20" aria-hidden="true">/</span>
      <a href={portugueseHref} hrefLang="pt-BR" aria-current={locale === "pt" ? "page" : undefined} className={`flex h-6 items-center px-2 transition-colors focus:outline-none focus-visible:text-mint ${locale === "pt" ? "text-mint" : "text-steel hover:text-ceramic"}`}>
        PT
      </a>
    </div>
  );
}
