import { redirect } from "next/navigation";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  redirect(`/pt/projetos/${slug}`);
}
