"use client";

import { Archive, Check, ChevronDown, Inbox, Mail, Reply, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteContactMessageAction, updateContactMessageStatusAction } from "@/app/admin/messages/actions";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { ContactMessage, ContactMessageStatus } from "@/lib/supabase/contactMessages";

type MessageFilter = "all" | "new" | "archived";

const statusLabels: Record<ContactMessageStatus, string> = {
  new: "Nova",
  read: "Lida",
  replied: "Respondida",
  archived: "Arquivada"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(value));
}

function StatusAction({ id, status, icon: Icon, label }: { id: string; status: ContactMessageStatus; icon: typeof Check; label: string }) {
  return (
    <form action={updateContactMessageStatusAction}>
      <input name="id" type="hidden" value={id} />
      <input name="status" type="hidden" value={status} />
      <button type="submit" className="inline-flex h-9 items-center gap-2 border border-white/10 px-3 text-xs text-slate-400 transition hover:border-mint/50 hover:text-mint">
        <Icon size={14} />
        {label}
      </button>
    </form>
  );
}

export function AdminMessages({
  initialMessages,
  projectCount,
  pendingResumeCount,
  status
}: {
  initialMessages: ContactMessage[];
  projectCount: number;
  pendingResumeCount: number;
  status?: "updated" | "deleted" | "error";
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MessageFilter>("all");
  const newCount = initialMessages.filter((message) => message.status === "new").length;
  const archivedCount = initialMessages.filter((message) => message.status === "archived").length;
  const notificationFailures = initialMessages.filter((message) => message.notification_status === "failed").length;
  const visibleMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return initialMessages.filter((message) => {
      const matchesFilter = filter === "all" || message.status === filter;
      const matchesQuery = !normalizedQuery || [message.name, message.email, message.subject, message.message]
        .some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesFilter && matchesQuery;
    });
  }, [filter, initialMessages, query]);

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="mx-auto grid min-h-screen max-w-[96rem] lg:grid-cols-[15rem_minmax(0,1fr)]">
        <AdminSidebar active="messages" projectCount={projectCount} unreadMessageCount={newCount} pendingResumeCount={pendingResumeCount} />

        <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <header className="flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[0.58rem] uppercase text-mint">Portfólio / Contato</p>
              <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Mensagens</h1>
              <p className="mt-2 text-sm text-slate-500">Acompanhe conversas iniciadas pelo formulário público.</p>
            </div>
            <a href="mailto:gabrielmcgoes@gmail.com" className="inline-flex h-11 items-center justify-center gap-2 border border-white/10 px-4 text-sm text-slate-300 transition hover:border-mint/50 hover:text-mint">
              <Mail size={16} />
              Abrir e-mail
            </a>
          </header>

          {status ? (
            <p className={`mt-5 inline-flex border px-3 py-2 text-sm ${status === "error" ? "border-coral/40 bg-coral/10 text-coral" : "border-mint/40 bg-mint/10 text-mint"}`}>
              {status === "updated" ? "Mensagem atualizada." : null}
              {status === "deleted" ? "Mensagem excluída." : null}
              {status === "error" ? "Não foi possível concluir a ação." : null}
            </p>
          ) : null}

          <dl className="mt-7 grid grid-cols-3 border-y border-white/10">
            {[
              ["Novas", newCount],
              ["Arquivadas", archivedCount],
              ["Falhas de aviso", notificationFailures]
            ].map(([label, value], index) => (
              <div key={label} className={`py-4 ${index ? "border-l border-white/10 pl-4 sm:pl-6" : "pr-4"}`}>
                <dt className="font-mono text-[0.52rem] uppercase text-slate-500 sm:text-[0.58rem]">{label}</dt>
                <dd className="mt-2 text-2xl font-semibold text-white">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-8">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="search"
                  aria-label="Buscar mensagens"
                  placeholder="Buscar por nome, e-mail ou assunto"
                  className="h-11 w-full border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-white outline-none transition focus:border-mint/60"
                />
              </div>
              <div className="grid grid-cols-3 border border-white/10" aria-label="Filtrar mensagens">
                {(["all", "new", "archived"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    aria-pressed={filter === value}
                    className={`h-10 border-l border-white/10 px-3 text-xs first:border-l-0 sm:px-4 ${filter === value ? "bg-white text-ink" : "text-slate-400 hover:text-white"}`}
                  >
                    {value === "all" ? "Todas" : value === "new" ? "Novas" : "Arquivo"}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-x border-b border-white/10">
              {visibleMessages.map((contactMessage) => (
                <details key={contactMessage.id} className="group border-b border-white/10 last:border-b-0" open={contactMessage.status === "new"}>
                  <summary className="grid cursor-pointer list-none gap-3 px-4 py-4 transition hover:bg-white/[0.025] sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_9rem_1.5rem] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 ${contactMessage.status === "new" ? "bg-coral" : "bg-slate-600"}`} />
                        <span className="truncate text-sm font-medium">{contactMessage.name}</span>
                      </div>
                      <p className="mt-1 truncate pl-4 font-mono text-[0.58rem] text-slate-500">{contactMessage.email}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-200">{contactMessage.subject}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{contactMessage.message}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                      <span className={`font-mono text-[0.55rem] uppercase ${contactMessage.status === "new" ? "text-coral" : "text-slate-500"}`}>{statusLabels[contactMessage.status]}</span>
                      <time className="block text-[0.62rem] text-slate-600 sm:mt-1" dateTime={contactMessage.created_at}>{formatDate(contactMessage.created_at)}</time>
                    </div>
                    <ChevronDown size={16} className="hidden text-slate-600 transition group-open:rotate-180 sm:block" />
                  </summary>

                  <div className="border-t border-white/10 bg-black/15 px-4 py-5 sm:px-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_13rem]">
                      <div>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.58rem] uppercase text-slate-500">
                          <span>{contactMessage.locale === "pt" ? "Português" : "Inglês"}</span>
                          <span>Aviso: {contactMessage.notification_status === "sent" ? "enviado" : contactMessage.notification_status === "failed" ? "falhou" : contactMessage.notification_status === "pending" ? "pendente" : "sem Resend"}</span>
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-white">{contactMessage.subject}</h2>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">{contactMessage.message}</p>
                      </div>

                      <div className="flex flex-col gap-2 border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                        <a
                          href={`mailto:${contactMessage.email}?subject=${encodeURIComponent(`Re: ${contactMessage.subject}`)}`}
                          className="inline-flex h-9 items-center gap-2 bg-mint px-3 text-xs font-semibold text-ink transition hover:bg-white"
                        >
                          <Reply size={14} />
                          Responder
                        </a>
                        {contactMessage.status === "new" ? <StatusAction id={contactMessage.id} status="read" icon={Check} label="Marcar como lida" /> : null}
                        {contactMessage.status !== "replied" ? <StatusAction id={contactMessage.id} status="replied" icon={Reply} label="Marcar respondida" /> : null}
                        {contactMessage.status !== "archived" ? <StatusAction id={contactMessage.id} status="archived" icon={Archive} label="Arquivar" /> : null}
                        <form action={deleteContactMessageAction} onSubmit={(event) => {
                          if (!window.confirm(`Excluir a mensagem de ${contactMessage.name}?`)) {
                            event.preventDefault();
                          }
                        }}>
                          <input name="id" type="hidden" value={contactMessage.id} />
                          <button type="submit" className="inline-flex h-9 w-full items-center gap-2 border border-white/10 px-3 text-xs text-slate-500 transition hover:border-coral/60 hover:text-coral">
                            <Trash2 size={14} />
                            Excluir
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </details>
              ))}

              {!visibleMessages.length ? (
                <div className="flex flex-col items-center px-4 py-14 text-center">
                  <Inbox size={22} className="text-slate-600" />
                  <p className="mt-3 text-sm text-slate-500">Nenhuma mensagem corresponde a este filtro.</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
