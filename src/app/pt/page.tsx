import type { Metadata } from "next";
import { PortfolioHome } from "@/components/portfolio/PortfolioHome";
import { localizedAlternates, localizeProjects } from "@/lib/i18n";
import { getProfilePhoto } from "@/lib/supabase/profile";
import { getPublicProjects } from "@/lib/supabase/projects";

export const metadata: Metadata = {
  title: "Gabriel Morgado | Desenvolvedor Full-stack",
  description: "Produtos digitais entre interface, sistemas e segurança, projetados e desenvolvidos por Gabriel Morgado.",
  alternates: localizedAlternates("pt", "/", "/pt")
};

export default async function PortugueseHome() {
  const [rows, photo] = await Promise.all([getPublicProjects(), getProfilePhoto()]);
  const projects = localizeProjects(rows, "pt");

  return <PortfolioHome locale="pt" projects={projects} photoUrl={photo.url} />;
}
