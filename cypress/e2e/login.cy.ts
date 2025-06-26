// cypress/e2e/login.cy.ts

describe('Login flow', () => {
  it('แสดงข้อความ error เมื่อใส่ข้อมูลผิด', () => {
    cy.visit('/login');
    cy.get('[data-cy="login-citizenId"]').type('wrong');
    cy.get('[data-cy="login-password"]').type('bad');
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="login-error"]')
      .should('be.visible')
      .and('contain', 'กรุณากรอกรหัสผ่าน');
  });

  it('redirect ไปหน้า dashboard/community เมื่อ login สำเร็จ', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'fake-token',
        user: { nationalId: '3500200461028', role: 'COMMUNITY' },
      },
    }).as('loginReq');

    cy.intercept('GET', '/api/auth/profile', {
      statusCode: 200,
      body: { user: { nationalId: '3500200461028', role: 'COMMUNITY' } },
    }).as('profileReq');

    cy.visit('/login');
    cy.get('[data-cy="login-citizenId"]').type('3500200461028');
    cy.get('[data-cy="login-password"]').type('correctPass');
    cy.get('[data-cy="login-submit"]').click();

    cy.wait('@loginReq');
    cy.wait('@profileReq');
    cy.url().should('include', '/dashboard/community');
  });
});
