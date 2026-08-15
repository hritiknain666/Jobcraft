export type GreenhouseJob = {
  id?: number | string;
  title?: string;
  location?: { name?: string };
  absolute_url?: string;
  updated_at?: string;
  content?: string;
};

export type GreenhouseBoardPayload = {
  boardToken: string;
  boardName: string;
  jobs: GreenhouseJob[];
};

export async function fetchGreenhouseBoard(boardToken: string): Promise<GreenhouseBoardPayload> {
  const token = boardToken.trim().slice(0, 120);
  if (!token || !/^[a-z0-9_-]+$/i.test(token)) throw new Error("Invalid Greenhouse board token.");
  const encoded = encodeURIComponent(token);

  const [boardResponse, jobsResponse] = await Promise.all([
    fetch(`https://boards-api.greenhouse.io/v1/boards/${encoded}`, {
      headers: { Accept: "application/json", "User-Agent": "JobCraft/1.0" },
      cache: "no-store",
    }),
    fetch(`https://boards-api.greenhouse.io/v1/boards/${encoded}/jobs?content=true`, {
      headers: { Accept: "application/json", "User-Agent": "JobCraft/1.0" },
      cache: "no-store",
    }),
  ]);

  if (!boardResponse.ok) throw new Error(`Greenhouse board request failed with status ${boardResponse.status}.`);
  if (!jobsResponse.ok) throw new Error(`Greenhouse jobs request failed with status ${jobsResponse.status}.`);

  const board = await boardResponse.json() as { name?: string };
  const payload = await jobsResponse.json() as { jobs?: GreenhouseJob[] };
  return {
    boardToken: token,
    boardName: board.name?.trim() || token,
    jobs: payload.jobs ?? [],
  };
}
