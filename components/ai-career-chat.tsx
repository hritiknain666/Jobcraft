"use client";

import { FormEvent, useState } from "react";

type AiCareerChatProps = {
  jobId?: string | null;
};

export default function AiCareerChat({ jobId }: AiCareerChatProps) {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = prompt.trim();
    if (!question || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch("/api/ai/career-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question, jobId: jobId || undefined }),
      });
      const payload = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !payload.answer) throw new Error(payload.error || "AI assistant is unavailable.");
      setAnswer(payload.answer);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "AI assistant is unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="jc-dark-card p-6 sm:p-8" aria-labelledby="jobcraft-ai-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="jc-eyebrow !text-[#f49a48]">JOBCRAFT AI</p>
          <h2 id="jobcraft-ai-heading" className="jc-section-title !mt-3 !text-white">Ask about your next career move.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b5c7c0]">Ask about a role, your match, application strategy, interview preparation or what to improve next. JobCraft sends only the minimum profile and job context needed for the answer.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.12em] text-[#b5c7c0]">AI beta</span>
      </div>

      <form onSubmit={submit} className="mt-6">
        <label htmlFor="jobcraft-ai-question" className="sr-only">Ask JobCraft AI</label>
        <textarea
          id="jobcraft-ai-question"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          maxLength={2000}
          rows={4}
          placeholder={jobId ? "Ask about this job, your fit, or interview preparation…" : "Example: Which roles should I prioritise this week and why?"}
          className="w-full resize-y rounded-[16px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-[#80978f] focus:border-[#f49a48]"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] text-[#8ea49c]">{prompt.length}/2000 · Your saved resume file is not sent by default.</span>
          <button disabled={loading || !prompt.trim()} className="rounded-[13px] bg-[#f49a48] px-5 py-3 text-sm font-black text-[#173f33] disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "Thinking…" : "Ask JobCraft AI →"}
          </button>
        </div>
      </form>

      {error ? <div className="mt-5 rounded-[15px] border border-[#805f43]/40 bg-[#5b442f]/30 p-4 text-sm leading-6 text-[#f2d6b8]">{error}</div> : null}
      {answer ? <div className="mt-5 whitespace-pre-wrap rounded-[16px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-white">{answer}</div> : null}
    </section>
  );
}
