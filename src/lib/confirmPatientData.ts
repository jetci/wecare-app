export async function confirmPatientData(payload: Record<string, unknown>): Promise<Response> {
  return fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
}
