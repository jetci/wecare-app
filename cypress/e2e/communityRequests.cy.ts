describe('Community Requests List E2E', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/community/requests*', (req) => {
      const params = req.query;
      if (params.nationalId === 'empty') {
        req.reply([]);
      } else {
        req.reply([
          {
            id: 1,
            nationalId: '1234567890123',
            type: 'help',
            status: 'pending',
            details: 'ขอความช่วยเหลือ',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    }).as('getRequests');
    // ทดสอบ API โดยตรง แทนการ visit หน้า UI
    cy.request('/api/community/requests').as('apiRequest');
  });

  it('แสดง skeleton loader ขณะโหลด', () => {
    cy.get('div.animate-pulse').should('exist');
  });

  it('แสดงข้อมูลในตารางเมื่อโหลดสำเร็จ', () => {
    cy.wait('@getRequests');
    cy.get('table').should('exist');
    cy.contains('1234567890123');
    cy.contains('help');
    cy.contains('pending');
  });

  it('สามารถกรองข้อมูลด้วย nationalId/type/status', () => {
    cy.get('input[name="nationalId"]').clear().type('1234567890123');
    cy.get('input[name="type"]').clear().type('help');
    cy.get('select[name="status"]').select('pending');
    cy.wait('@getRequests');
    cy.contains('1234567890123');
    cy.contains('help');
    cy.contains('pending');
  });

  it('สามารถเปลี่ยนหน้าด้วยปุ่ม Next/Prev', () => {
    cy.get('button').contains('Next').click();
    cy.wait('@getRequests');
    cy.get('button').contains('Prev').click();
    cy.wait('@getRequests');
  });

  it('แสดง empty state เมื่อไม่มีข้อมูล', () => {
    cy.get('input[name="nationalId"]').clear().type('empty');
    cy.wait('@getRequests');
    cy.contains('ไม่พบข้อมูล');
  });
});
