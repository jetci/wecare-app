import '@testing-library/jest-dom/vitest';
describe('Driver Cases E2E Flow', () => {
  const token = Cypress.env('DRIVER_TOKEN');
  let caseId: string;

  it('Fetches available cases', () => {
    cy.request({
      method: 'GET',
      url: '/api/driver/cases',
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.cases).to.be.an('array');
      // pick first pending case
      const pending = res.body.cases.find((c: any) => c.status === 'PENDING');
      expect(pending).to.exist;
      caseId = pending.id;
    });
  });

  it('Accepts a case', () => {
    cy.request({
      method: 'POST',
      url: '/api/driver/cases',
      headers: { Authorization: `Bearer ${token}` },
      body: { id: caseId, action: 'accept' },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.ride.status).to.equal('ACCEPTED');
    });
  });

  it('Completes the case', () => {
    cy.request({
      method: 'POST',
      url: '/api/driver/cases',
      headers: { Authorization: `Bearer ${token}` },
      body: { id: caseId, action: 'complete' },
    }).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.ride.status).to.equal('COMPLETED');
    });
  });
});

