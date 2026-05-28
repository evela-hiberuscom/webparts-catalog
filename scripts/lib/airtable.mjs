import { loadEnvFile, requireEnv } from "./env.mjs";

loadEnvFile();

const API_BASE = "https://api.airtable.com/v0";

function getHeaders() {
  return {
    Authorization: `Bearer ${requireEnv("AIRTABLE_API_TOKEN")}`,
    "Content-Type": "application/json"
  };
}

export async function fetchAllRecords({ tableName = "Table 1", viewName = "Grid view", pageSize = 100 } = {}) {
  const baseId = requireEnv("AIRTABLE_BASE_ID");
  const headers = getHeaders();
  const records = [];
  let offset;

  do {
    const url = new URL(`${API_BASE}/${baseId}/${encodeURIComponent(tableName)}`);
    url.searchParams.set("view", viewName);
    url.searchParams.set("pageSize", String(pageSize));
    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Airtable fetch failed: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    records.push(...payload.records);
    offset = payload.offset;
  } while (offset);

  return records;
}

export async function updateRecord(recordId, fields, { tableName = "Table 1" } = {}) {
  const baseId = requireEnv("AIRTABLE_BASE_ID");
  const headers = getHeaders();
  const url = `${API_BASE}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ fields })
  });

  if (!response.ok) {
    throw new Error(`Airtable update failed for ${recordId}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
