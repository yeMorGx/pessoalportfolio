import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { PageLoader } from "@/components/ui/PageLoader";
import type { Locale } from "@/lib/i18n";
import type { Project } from "@/lib/projects";

export function PortfolioHome({ locale, projects }: { locale: Locale; projects: Project[] }) {
  return (
    <>
      <PageLoader locale={locale} />
      <main lang={locale === "pt" ? "pt-BR" : "en"} className="relative overflow-hidden bg-ink">
        <SiteHeader locale={locale} />
        <Hero locale={locale} />
        <About locale={locale} />
        <Projects locale={locale} projects={projects} />
        <Experience locale={locale} />
        <Contact locale={locale} />
      </main>
    </>
  );
}
