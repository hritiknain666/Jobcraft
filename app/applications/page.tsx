import Link from "next/link";
import WorkspaceShell from "@/components/workspace-shell";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationRecord } from "@/lib/types/jobcraft";
import { deleteApplication, updateApplicationStatus } from "./actions";

const statuses = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"];

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <PublicApplicationsPreview />;

  const [{ data: applications }, { data: profile }] = await Promise.all([
    supabase.from("applications").select("id,status,created_at,updated_at,jobs(id,title,company,location,work_mode,salary_min_lpa,salary_max_lpa)").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("profiles").select("full_name,headline,city,experience_years,skills,target_roles,preferred_work_modes").eq("id", user.id).maybeSingle(),
  ]);

  const items = (applications ?? []) as unknown as ApplicationRecord[];
  const counts = Object.fromEntries(statuses.map((status) => [status, items.filter((item) => item.status === status).length]));
  const strength = profile ? Math.round(([profile.full_name, profile.headline, profile.city, profile.experience_years !== null && profile.experience_years !== undefined, (profile.skills?.length ?? 0) > 0, (profile.target_roles?.length ?? 0) > 0, (profile.preferred_work_modes?.length ?? 0) > 0].filter(Boolean).length / 7) * 100) : 0;
  const appliedLane = items.filter((item) => ["Applied", "Screening"].includes(item.status));
  const closed = items.filter((item) => item.status === "Rejected");

  return (
    <WorkspaceShell active="applications" name={profile?.full_name} headline={profile?.headline} strength={strength}>
      <div className="jc-content-wrap">
        <section className="jc-discover-head">
          <div>
            <p className="jc-eyebrow">YOUR SEARCH, IN MOTION</p>
            <h1 className="jc-page-title">Application plan</h1>
          </div>
          <Link href="/jobs" className="jc-button-primary">Find a role to add →</Link>
        </section>

        <div className="jc-pipeline-pills">
          <span className="jc-pipeline-pill is-active">All · {items.length}</span>
          <span className="jc-pipeline-pill">Saved · {counts.Saved ?? 0}</span>
          <span className="jc-pipeline-pill">Applied · {(counts.Applied ?? 0) + (counts.Screening ?? 0)}</span>
          <span className="jc-pipeline-pill">Interview · {counts.Interview ?? 0}</span>
          <span className="jc-pipeline-pill">Offer · {counts.Offer ?? 0}</span>
          <span className="jc-pipeline-pill">Closed · {counts.Rejected ?? 0}</span>
        </div>

        <section className="jc-board" aria-label="Application pipeline">
          <BoardColumn title="Saved" note="Worth a closer look" items={items.filter((item) => item.status === "Saved")} />
          <BoardColumn title="Applied" note="You made the move" items={appliedLane} />
          <BoardColumn title="Interview" note="Conversations in motion" items={items.filter((item) => item.status === "Interview")} />
          <BoardColumn title="Offer" note="A good problem to have" items={items.filter((item) => item.status === "Offer")} />
        </section>

        {closed.length ? (
          <section className="jc-card mt-7 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="jc-eyebrow">CLOSED LOOP</p><h2 className="jc-section-title">Past applications</h2></div>
              <span className="text-xs font-bold text-[#789087]">{closed.length} closed</span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {closed.map((item) => <ApplicationCard key={item.id} item={item} compact />)}
            </div>
          </section>
        ) : null}
      </div>
    </WorkspaceShell>
  );
}

function BoardColumn({ title, note, items }: { title: string; note: string; items: ApplicationRecord[] }) {
  return (
    <div className="jc-board-column">
      <div className="jc-board-title"><b>{title}</b><span className="jc-board-count">{items.length}</span></div>
      <p className="jc-board-note">{note}</p>
      {items.length ? items.map((item) => <ApplicationCard key={item.id} item={item} />) : <div className="mt-6 flex min-h-[190px] items-center justify-center rounded-[18px] border border-dashed border-[#d4cec2] text-center text-xs text-[#789087]">Nothing here yet</div>}
    </div>
  );
}

function ApplicationCard({ item, compact = false }: { item: ApplicationRecord; compact?: boolean }) {
  const job = item.jobs;
  return (
    <article className={`jc-application-card ${compact ? "mt-0" : ""}`}>
      <div className="jc-application-company">
        <span className="jc-company-dot">{companyInitials(job?.company || "JC")}</span>
        <span className="min-w-0">
          <Link href={job?.id ? `/jobs/${job.id}` : "/jobs"}><b>{job?.title || "Job"}</b></Link>
          <span>{job?.company || "JobCraft"} · {job?.location || "India"}</span>
        </span>
      </div>
      <div className="jc-application-actions">
        <form action={updateApplicationStatus}>
          <input type="hidden" name="id" value={item.id} />
          <select name="status" defaultValue={item.status} aria-label="Application status">
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <div className="jc-application-buttons mt-2">
            <button className="jc-mini-button">Update</button>
          </div>
        </form>
        {item.status === "Interview" && job?.id ? (
          <Link href={`/career-assistant?mode=interview&jobId=${job.id}`} className="jc-mini-button mt-2 inline-flex w-full justify-center no-underline">Prepare for this interview →</Link>
        ) : null}
        <div className="flex items-center justify-between gap-3 text-[10px] text-[#789087]">
          <span>{item.status === "Interview" ? "◷ Job-specific prep ready" : item.status === "Saved" ? "◷ Tailor resume" : `Updated ${new Date(item.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}</span>
          <form action={deleteApplication}><input type="hidden" name="id" value={item.id} /><button className="font-bold text-[#8b6d67]">Remove</button></form>
        </div>
      </div>
    </article>
  );
}

function PublicApplicationsPreview() {
  const demo = [
    { title: "Saved", note: "Worth a closer look", item: ["DA", "Data Analyst", "Analytics Co. · Bengaluru"] },
    { title: "Applied", note: "You made the move", item: ["BA", "Business Analyst", "Fintech Co. · Gurugram"] },
    { title: "Interview", note: "Conversations in motion", item: ["BI", "Power BI Developer", "Product Co. · Hyderabad"] },
    { title: "Offer", note: "A good problem to have", item: null },
  ];
  return (
    <WorkspaceShell active="applications" authenticated={false} name="Your profile" headline="Candidate" strength={0}>
      <div className="jc-content-wrap">
        <section className="jc-discover-head">
          <div><p className="jc-eyebrow">YOUR SEARCH, IN MOTION</p><h1 className="jc-page-title">Application plan</h1><p className="jc-page-copy">Save roles, track progress, prepare for conversations and keep the next action visible.</p></div>
          <Link href="/applications?auth=signup" scroll={false} className="jc-button-primary">Start your plan →</Link>
        </section>
        <div className="jc-pipeline-pills"><span className="jc-pipeline-pill is-active">All · 3</span><span className="jc-pipeline-pill">Saved · 1</span><span className="jc-pipeline-pill">Applied · 1</span><span className="jc-pipeline-pill">Interview · 1</span><span className="jc-pipeline-pill">Offer · 0</span></div>
        <section className="jc-board">
          {demo.map((column) => <div key={column.title} className="jc-board-column"><div className="jc-board-title"><b>{column.title}</b><span className="jc-board-count">{column.item ? 1 : 0}</span></div><p className="jc-board-note">{column.note}</p>{column.item ? <div className="jc-application-card"><div className="jc-application-company"><span className="jc-company-dot">{column.item[0]}</span><span><b>{column.item[1]}</b><span>{column.item[2]}</span></span></div><div className="jc-application-actions"><span className="text-[10px] text-[#789087]">Create an account to manage this stage.</span></div></div> : <div className="mt-6 flex min-h-[190px] items-center justify-center rounded-[18px] border border-dashed border-[#d4cec2] text-xs text-[#789087]">Nothing here yet</div>}</div>)}
        </section>
      </div>
    </WorkspaceShell>
  );
}

function companyInitials(company: string) {
  return String(company || "JC").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "JC";
}
