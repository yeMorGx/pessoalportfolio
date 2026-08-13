"use client";

import { ArchiveX, Check, Clipboard, ExternalLink, FileCheck2, FileUp, LoaderCircle, Mail, RotateCcw, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getFunctionErrorCode } from "@/lib/supabase/functionErrors";
import { RESUME_BUCKET, RESUME_FILE_PATH, type ResumeFileState, type ResumeRequest, type ResumeRequestStatus } from "@/lib/resume";

type RequestFilter = "all" | "pending" | "approved" | "closed";
type ReviewAction = "approve" | "reject" | "revoke" | "delete" | "note";
type AccessResult = { accessUrl: string; email: string; name: string; locale: "en" | "pt"; subject: string } | null;

const statusLabels: Record<ResumeRequestStatus, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Recusada",
  revoked: "Revogada"
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value));
}

function formatBytes(value: number | null) {
  return value ? `${(value / 1024 / 1024).toFixed(2)} MB` : "PDF";
}

export function AdminResumeRequests({
  initialRequests,
  fileState,
  projectCount,
  unreadMessageCount
}: {
  initialRequests: ResumeRequest[];
  fileState: ResumeFileState;
  projectCount: number;
  unreadMessageCount: number;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RequestFilter>("all");
  const [busyId, setBusyId] = useState("");
  const [fileBusy, setFileBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [accessResult, setAccessResult] = useState<AccessResult>(null);
  const pendingCount = initialRequests.filter((request) => request.status === "pending").length;
  const approvedCount = initialRequests.filter((request) => request.status === "approved").length;
  const visibleRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return initialRequests.filter((request) => {
      const matchesFilter = filter === "all"
        || request.status === filter
        || (filter === "closed" && ["rejected", "revoked"].includes(request.status));
      const matchesQuery = !normalizedQuery || [request.name, request.email, request.company, request.job_title, request.purpose]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesFilter && matchesQuery;
    });
  }, [filter, initialRequests, query]);

  async function uploadResume(file: File) {
    if (file.type !== "application/pdf" || file.size <= 0 || file.size > 5 * 1024 * 1024) {
      setFeedback("Selecione um PDF de até 5 MB.");
      return;
    }

    setFileBusy(true);
    setFeedback("");
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setFeedback("Supabase não está disponível.");
      setFileBusy(false);
      return;
    }

    const { error } = await supabase.storage.from(RESUME_BUCKET).upload(RESUME_FILE_PATH, file, {
      contentType: "application/pdf",
      upsert: true,
      cacheControl: "0"
    });
    setFeedback(error ? `Não foi possível enviar o PDF: ${error.message}` : "PDF privado atualizado.");
    setFileBusy(false);
    router.refresh();
  }

  async function removeResume() {
    if (!window.confirm("Remover o PDF privado? Novas aprovações ficarão bloqueadas até outro arquivo ser enviado.")) return;

    setFileBusy(true);
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setFeedback("Supabase não está disponível.");
      setFileBusy(false);
      return;
    }

    const { error } = await supabase.storage.from(RESUME_BUCKET).remove([RESUME_FILE_PATH]);
    setFeedback(error ? "Não foi possível remover o PDF." : "PDF removido.");
    setFileBusy(false);
    router.refresh();
  }

  async function review(request: ResumeRequest, action: ReviewAction, note?: string) {
    if (["reject", "revoke", "delete"].includes(action)) {
      const label = action === "reject" ? "recusar" : action === "revoke" ? "revogar" : "excluir";
      if (!window.confirm(`Deseja ${label} a solicitação de ${request.name}?`)) return;
    }

    setBusyId(request.id);
    setFeedback("");
    setAccessResult(null);
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setFeedback("Supabase não está disponível.");
      setBusyId("");
      return;
    }

    const { data, error } = await supabase.functions.invoke("review-resume-request", {
      body: { id: request.id, action, note }
    });

    if (error) {
      const code = await getFunctionErrorCode(error, data);
      setFeedback(code === "FILE_UNAVAILABLE" ? "Envie o PDF privado antes de aprovar." : "Não foi possível concluir a ação.");
    } else if (action === "approve" && data?.accessUrl) {
      setAccessResult({
        accessUrl: data.accessUrl,
        email: request.email,
        name: request.name,
        locale: request.locale,
        subject: request.locale === "pt" ? "Acesso ao currículo de Gabriel Morgado" : "Access to Gabriel Morgado's resume"
      });
      setFeedback(data.notificationStatus === "sent" ? "Acesso aprovado e enviado por e-mail." : "Acesso aprovado. Compartilhe o link pelo Gmail.");
    } else {
      setFeedback(action === "note" ? "Nota salva." : "Solicitação atualizada.");
    }

    setBusyId("");
    router.refresh();
  }

  function gmailHref(result: NonNullable<AccessResult>) {
    const body = result.locale === "pt"
      ? `Olá, ${result.name}. Sua solicitação foi aprovada. Este link privado fica disponível por 72 horas:\n\n${result.accessUrl}`
      : `Hello, ${result.name}. Your request was approved. This private link is available for 72 hours:\n\n${result.accessUrl}`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(result.email)}&su=${encodeURIComponent(result.subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="mx-auto grid min-h-screen max-w-[96rem] lg:grid-cols-[15rem_minmax(0,1fr)]">
        <AdminSidebar active="resume" projectCount={projectCount} unreadMessageCount={unreadMessageCount} pendingResumeCount={pendingCount} />

        <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <header className="border-b border-white/10 pb-7">
            <p className="font-mono text-[0.58rem] uppercase text-mint">Portfólio / Acesso profissional</p>
            <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Solicitações de currículo</h1>
            <p className="mt-2 text-sm text-slate-500">Revise o contexto antes de liberar um acesso temporário.</p>
          </header>

          <section className="mt-7 grid gap-5 border-y border-white/10 py-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border ${fileState.available ? "border-mint/30 bg-mint/10 text-mint" : "border-coral/30 bg-coral/10 text-coral"}`}>
                {fileState.available ? <FileCheck2 size={18} /> : <ArchiveX size={18} />}
              </span>
              <div>
                <h2 className="text-sm font-semibold">{fileState.available ? "PDF privado disponível" : "PDF final ainda não enviado"}</h2>
                <p className="mt-1 text-xs text-slate-500">{fileState.available ? `${formatBytes(fileState.size)} · atualizado em ${formatDate(fileState.updatedAt)}` : "As solicitações entram normalmente, mas a aprovação fica bloqueada."}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadResume(file);
                event.currentTarget.value = "";
              }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={fileBusy} className="inline-flex h-10 items-center gap-2 bg-mint px-4 text-xs font-semibold text-ink transition hover:bg-white disabled:opacity-60">
                {fileBusy ? <LoaderCircle size={14} className="animate-spin" /> : <FileUp size={14} />}
                {fileState.available ? "Substituir PDF" : "Enviar PDF"}
              </button>
              {fileState.available ? <button type="button" onClick={removeResume} disabled={fileBusy} title="Remover PDF" className="inline-flex h-10 w-10 items-center justify-center border border-white/10 text-slate-500 transition hover:border-coral/50 hover:text-coral"><Trash2 size={14} /></button> : null}
            </div>
          </section>

          {feedback ? <p className="mt-5 border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300" aria-live="polite">{feedback}</p> : null}
          {accessResult ? (
            <section className="mt-5 border border-mint/30 bg-mint/[0.06] p-4">
              <p className="font-mono text-[0.58rem] uppercase text-mint">Link exibido uma única vez</p>
              <p className="mt-2 break-all text-xs leading-5 text-slate-300">{accessResult.accessUrl}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => navigator.clipboard.writeText(accessResult.accessUrl)} className="inline-flex h-9 items-center gap-2 border border-white/10 px-3 text-xs text-white hover:border-mint/50"><Clipboard size={14} />Copiar link</button>
                <a href={gmailHref(accessResult)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 bg-white px-3 text-xs font-semibold text-ink"><Mail size={14} />Responder no Gmail</a>
              </div>
            </section>
          ) : null}

          <dl className="mt-7 grid grid-cols-3 border-y border-white/10">
            {[["Pendentes", pendingCount], ["Aprovadas", approvedCount], ["Total", initialRequests.length]].map(([label, value], index) => (
              <div key={label} className={`py-4 ${index ? "border-l border-white/10 pl-4 sm:pl-6" : "pr-4"}`}>
                <dt className="font-mono text-[0.52rem] uppercase text-slate-500 sm:text-[0.58rem]">{label}</dt>
                <dd className="mt-2 text-2xl font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-8">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Buscar por pessoa, empresa ou cargo" className="h-11 w-full border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-white outline-none focus:border-mint/60" /></div>
              <div className="grid grid-cols-4 border border-white/10">
                {(["all", "pending", "approved", "closed"] as const).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`h-10 border-l border-white/10 px-2 text-[0.65rem] first:border-l-0 sm:px-3 ${filter === value ? "bg-white text-ink" : "text-slate-400"}`}>{value === "all" ? "Todas" : value === "pending" ? "Pendentes" : value === "approved" ? "Aprovadas" : "Encerradas"}</button>)}
              </div>
            </div>

            <div className="border-x border-b border-white/10">
              {visibleRequests.map((request) => (
                <details key={request.id} open={request.status === "pending"} className="group border-b border-white/10 last:border-b-0">
                  <summary className="grid cursor-pointer list-none gap-3 px-4 py-4 hover:bg-white/[0.025] sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_8rem] sm:items-center">
                    <div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-2 w-2 ${request.status === "pending" ? "bg-coral" : request.status === "approved" ? "bg-mint" : "bg-slate-600"}`} /><span className="truncate text-sm font-medium">{request.name}</span></div><p className="mt-1 truncate pl-4 font-mono text-[0.58rem] text-slate-500">{request.email}</p></div>
                    <div className="min-w-0"><p className="truncate text-sm text-slate-200">{request.company}</p><p className="mt-1 truncate text-xs text-slate-500">{request.job_title}</p></div>
                    <div className="flex items-center justify-between gap-3 sm:block sm:text-right"><span className="font-mono text-[0.55rem] uppercase text-slate-400">{statusLabels[request.status]}</span><time className="block text-[0.62rem] text-slate-600 sm:mt-1">{formatDate(request.created_at)}</time></div>
                  </summary>

                  <div className="border-t border-white/10 bg-black/15 px-4 py-5 sm:px-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem]">
                      <div>
                        <div className="flex flex-wrap gap-4 font-mono text-[0.58rem] uppercase text-slate-500"><span>{request.locale === "pt" ? "Português" : "Inglês"}</span><span>Aviso: {request.request_notification_status}</span><span>Downloads: {request.download_count}</span></div>
                        <h2 className="mt-4 text-lg font-semibold">{request.company} / {request.job_title}</h2>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">{request.purpose}</p>
                        {request.linkedin_url ? <a href={request.linkedin_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs text-mint"><ExternalLink size={13} />LinkedIn</a> : null}
                        <textarea defaultValue={request.admin_note ?? ""} id={`note-${request.id}`} placeholder="Nota interna" maxLength={1000} className="mt-5 min-h-20 w-full border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-mint/50" />
                        <button type="button" onClick={() => { const note = (document.getElementById(`note-${request.id}`) as HTMLTextAreaElement | null)?.value ?? ""; void review(request, "note", note); }} disabled={busyId === request.id} className="mt-2 h-9 border border-white/10 px-3 text-xs text-slate-400 hover:text-white">Salvar nota</button>
                      </div>
                      <div className="flex flex-col gap-2 border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                        <button type="button" onClick={() => review(request, "approve")} disabled={busyId === request.id || !fileState.available} className="inline-flex h-9 items-center gap-2 bg-mint px-3 text-xs font-semibold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">{busyId === request.id ? <LoaderCircle size={14} className="animate-spin" /> : request.status === "approved" ? <RotateCcw size={14} /> : <Check size={14} />}{request.status === "approved" ? "Renovar acesso" : "Aprovar 72h"}</button>
                        {request.status === "pending" ? <button type="button" onClick={() => review(request, "reject")} disabled={busyId === request.id} className="inline-flex h-9 items-center gap-2 border border-white/10 px-3 text-xs text-slate-400 hover:border-coral/50 hover:text-coral"><X size={14} />Recusar</button> : null}
                        {request.status === "approved" ? <button type="button" onClick={() => review(request, "revoke")} disabled={busyId === request.id} className="inline-flex h-9 items-center gap-2 border border-white/10 px-3 text-xs text-slate-400 hover:border-coral/50 hover:text-coral"><ArchiveX size={14} />Revogar acesso</button> : null}
                        <button type="button" onClick={() => review(request, "delete")} disabled={busyId === request.id} className="inline-flex h-9 items-center gap-2 border border-white/10 px-3 text-xs text-slate-500 hover:border-coral/50 hover:text-coral"><Trash2 size={14} />Excluir</button>
                        {request.access_expires_at ? <p className="pt-2 text-[0.65rem] leading-5 text-slate-600">Expira: {formatDate(request.access_expires_at)}<br />Último download: {formatDate(request.last_download_at)}</p> : null}
                      </div>
                    </div>
                  </div>
                </details>
              ))}
              {!visibleRequests.length ? <div className="px-4 py-14 text-center text-sm text-slate-500">Nenhuma solicitação neste filtro.</div> : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
