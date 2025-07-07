describe('Officer Dashboard E2E', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/officer/patients', { statusCode: 200, body: [{ id: '1', area: 'X' }] });
    cy.intercept('GET', '/api/officer/appointments', { statusCode: 200, body: [{ id: '2', area: 'Y', status: 'pending', date: new Date().toISOString() }] });
    cy.visit('/dashboard/officer');
  });

  it('shows loading then data', () => {
    cy.get('[data-testid=loading]').should('exist');
    cy.get('[data-testid=patients-count]', { timeout: 10000 }).should('contain', 'Patients: 1');
    cy.get('[data-testid=appointments-count]').should('contain', 'Appointments: 1');
  });

  it('approve and deny buttons call API', () => {
    cy.intercept('POST', '/api/officer/appointments/2/approve', { statusCode: 200 }).as('approve');
    cy.intercept('POST', '/api/officer/appointments/2/deny', { statusCode: 200 }).as('deny');

    cy.get('button[data-testid=approve-btn]').click();
    cy.wait('@approve');

    cy.get('button[data-testid=deny-btn]').click();
    cy.wait('@deny');
  });
});
