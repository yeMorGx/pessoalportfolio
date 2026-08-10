import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { getPublicProjects } from "@/lib/supabase/projects";

export default async function Home() {
  const projects = await getPublicProjects();

  return (
    <main className="relative overflow-hidden">
      <SiteHeader />
      <Hero />
      <About />
      <Projects projects={projects} />
      <Experience />
      <Contact />
    </main>
  );
}
