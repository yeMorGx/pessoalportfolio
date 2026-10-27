"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createProfileUpload, saveProfilePhoto } from "@/app/admin/profile/actions";
import { DEFAULT_PROFILE_PHOTO, MAX_PROFILE_BYTES, PROFILE_BUCKET, PROFILE_TYPES } from "@/lib/profile";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function ProfilePhotoEditor({ initialPhoto, initialCustom, available }: { initialPhoto: string; initialCustom: boolean; available: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [savedPhoto, setSavedPhoto] = useState(initialPhoto);
  const [custom, setCustom] = useState(initialCustom);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || busy) return;
    setBusy(true); setError(""); setMessage("Enviando foto…");
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase não está configurado neste ambiente.");
      const target = await createProfileUpload({ type: file.type, size: file.size });
      if (!target.ok) throw new Error(target.message);
      const { error: uploadError } = await supabase.storage.from(PROFILE_BUCKET).uploadToSignedUrl(target.path, target.token, file, { contentType: file.type });
      if (uploadError) throw new Error("O envio falhou. Confira sua conexão e tente novamente.");
      setMessage("Salvando foto…");
      const result = await saveProfilePhoto(target.path);
      if (!result.ok) throw new Error(result.message);
      setSavedPhoto(supabase.storage.from(PROFILE_BUCKET).getPublicUrl(target.path).data.publicUrl);
      setCustom(true); setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setMessage("Foto salva. A seção Sobre já usa a nova imagem.");
      router.refresh();
    } catch (cause) {
      setMessage(""); setError(cause instanceof Error ? cause.message : "Não foi possível salvar. Tente novamente.");
    } finally { setBusy(false); }
  }

  async function restore() {
    setBusy(true); setError(""); setMessage("Restaurando foto original…");
    try {
      const result = await saveProfilePhoto(null);
      if (!result.ok) throw new Error(result.message);
      setSavedPhoto(DEFAULT_PROFILE_PHOTO); setCustom(false); setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setMessage("Foto original restaurada."); router.refresh();
    } catch (cause) {
      setMessage(""); setError(cause instanceof Error ? cause.message : "Não foi possível restaurar. Tente novamente.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={save} className="mt-8 grid items-start gap-8 border-t border-white/10 pt-8 sm:grid-cols-[minmax(0,18rem)_1fr]" aria-busy={busy}>
      <div>
        <div className="relative aspect-[4/5] overflow-hidden bg-graphite">
          <Image src={preview ?? savedPhoto} alt="Prévia da foto da seção Sobre" fill sizes="(min-width: 640px) 288px, 100vw" unoptimized={Boolean(preview)} className="object-cover object-[center_66%]" />
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">{file ? "Nova foto — salve para publicar a troca." : "Foto atual da seção Sobre."}</p>
      </div>
      <fieldset disabled={busy || !available} className="min-w-0 space-y-5 disabled:opacity-60">
        <div>
          <label htmlFor="profile-photo" className="block text-sm font-semibold">Escolher nova foto</label>
          <p id="photo-help" className="mt-2 text-sm leading-6 text-slate-400">JPG, PNG ou WebP, até 5 MB. Prefira uma foto vertical com o rosto bem visível.</p>
          <input ref={inputRef} id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help" className="mt-4 block w-full text-sm text-slate-300 file:mr-3 file:cursor-pointer file:border file:border-white/20 file:bg-transparent file:px-4 file:py-3 file:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint" onChange={async (event) => {
            const selected = event.target.files?.[0];
            setError(""); setMessage(""); setFile(null);
            if (!selected) return;
            if (!PROFILE_TYPES[selected.type] || selected.size <= 0 || selected.size > MAX_PROFILE_BYTES) {
              setError("Escolha uma foto JPG, PNG ou WebP de até 5 MB."); event.target.value = ""; return;
            }
            try { const bitmap = await createImageBitmap(selected); bitmap.close(); setFile(selected); }
            catch { setError("Este arquivo não pôde ser lido como imagem. Escolha outra foto."); event.target.value = ""; }
          }} />
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={!file || busy} className="min-h-12 bg-mint px-5 text-sm font-semibold text-ink hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Aguarde…" : "Salvar foto"}</button>
          {custom && !file ? <button type="button" onClick={restore} className="min-h-12 border border-white/20 px-4 text-sm text-slate-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint">Restaurar original</button> : null}
          {file ? <button type="button" onClick={() => { setFile(null); setError(""); setMessage(""); if (inputRef.current) inputRef.current.value = ""; }} className="min-h-12 px-4 text-sm text-slate-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint">Cancelar seleção</button> : null}
        </div>
      </fieldset>
      <div className="sm:col-span-2">
        {!available ? <p role="alert" className="text-sm text-coral">O armazenamento da foto ainda não está configurado neste ambiente. Aplique a migração profile_photo antes de enviar.</p> : null}
        {error ? <p role="alert" className="text-sm text-coral">{error}</p> : null}
        <p role="status" className="text-sm text-mint">{message}</p>
      </div>
    </form>
  );
}
