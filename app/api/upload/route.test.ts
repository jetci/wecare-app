import '@testing-library/jest-dom/vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('/api/upload API', () => {
  const makeReq = async (hasFile: boolean) => {
    const formData = new FormData();
    if (hasFile) {
      const blob = new Blob(['test'], { type: 'text/plain' });
      formData.append('file', new File([blob], 'test.txt', { type: 'text/plain' }));
    }
    return {
      formData: () => Promise.resolve(formData),
    } as unknown as NextRequest;
  };

  it('returns url when file provided', async () => {
    const req = await makeReq(true);
    const resp = await POST(req);
    const data = await resp.json();
    expect(data.url).toMatch(/\/uploads\//);
    expect(resp.status).to.equal(200);
  });

  it('returns null url when no file', async () => {
    const req = await makeReq(false);
    const resp = await POST(req);
    const data = await resp.json();
    expect(data.url).to.be.null();
    expect(resp.status).to.equal(200);
  });
});

