describe('Add Patient Workflow E2E', () => {
  beforeEach(() => {
    // Stub GET patients initial (empty)
    cy.intercept('GET', '/api/patients', (req) => {
      req.reply({ success: true, patients: [] });
    }).as('getPatientsEmpty');

    // Stub POST create patient
    cy.intercept('POST', '/api/patients', (req) => {
      const body = req.body;
      req.reply({
        statusCode: 201,
        body: { success: true, patient: { ...body, id: 'new-id' } }
      });
    }).as('postPatient');

    // Stub GET patients after create
    cy.intercept('GET', '/api/patients', (req) => {
      req.reply({
        success: true,
        patients: [{ id: 'new-id', firstName: 'Test', lastName: 'Patient', nationalId: '1111111111111', gender: 'ชาย' }]
      });
    }).as('getPatientsAfter');

    // Visit community dashboard
    cy.visit('/dashboard/community');
    cy.wait('@getPatientsEmpty');
  });

  it('should add a new patient and update dropdown', () => {
    // Open Add Patient Modal
    cy.contains('เพิ่มผู้ป่วยในความดูแล').click();
    // Fill form fields
    cy.get('select[name="prefix"]').select('นาย');
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('Patient');
    cy.get('input[name="nationalId"]').type('1111111111111');
    // Set birth date via datepicker
    cy.get('input[name="birthDate"]').type('01011990');
    // Submit form
    cy.get('button[type="submit"]').click();
    // Wait for API calls
    cy.wait('@postPatient');
    cy.wait('@getPatientsAfter');
    // Success feedback
    cy.contains('เพิ่มข้อมูลผู้ป่วยสำเร็จ!').should('be.visible');
    // Modal should close
    cy.get('.headlessui-dialog').should('not.exist');
    // Dropdown should include new patient
    cy.get('select#patient-selector').select('1111111111111');
    cy.get('select#patient-selector').should('have.value', '1111111111111');
  });
});
