import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProfilePhotoEditor } from "@/components/admin/ProfilePhotoEditor";
import { isAllowedAdminEmail } from "@/lib/auth/admin";
import { ensurePortfolioAdminAccess } from "@/lib/supabase/adminAccess";
import { getProfilePhoto } from "@/lib/supabase/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminProfilePage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login?error=config");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAllowedAdminEmail(user.email)) redirect("/admin/login?error=unauthorized");
  await ensurePortfolioAdminAccess();
  const photo = await getProfilePhoto();

  return (
    <main className="min-h-screen bg-ink text-white lg:grid lg:grid-cols-[15rem_1fr]">
      <AdminSidebar active="profile" />
      <section className="min-w-0 px-5 py-8 sm:px-8 lg:p-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-3xl font-semibold">Foto do perfil</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Troque a foto exibida na seção Sobre do portfólio, em português e inglês.</p>
          <ProfilePhotoEditor initialPhoto={photo.url} initialCustom={photo.custom} available={photo.available} />
        </div>
      </section>
    </main>
  );
}
