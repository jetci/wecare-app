# Testing Guide

This directory contains utilities, mocks, and setup for unit and integration tests using Vitest and React Testing Library.

## Folder Structure

```
src/test/
  mocks/                # MSW handlers and server
  utils/                # render helpers, form test utils
  vitest.setup.ts       # global test setup
  README.md             # this guide
```

## Setup

Vitest will load `src/test/vitest.setup.ts` before running tests.
Ensure `vitest.config.ts` includes:
```ts
setupFiles: ['src/test/vitest.setup.ts'],
passWithNoTests: true,
```

## Writing Tests

### File Naming

- Unit & component tests: `*.test.tsx` (located next to code or in `src/test`)
- Integration tests: `*.spec.tsx` under `src/app/...`
- E2E tests: `*.cy.ts` in `cypress/e2e`

### Mocking API

Use MSW handlers in `src/test/mocks/handlers.ts`:
```ts
import { rest } from 'msw';
// define handlers
```
Server is set up in `src/test/mocks/server.ts`.

### Utilities

- `renderWithProviders(ui)` wraps components with `AuthProvider` or other contexts.
- `renderForm(component)` provides form utilities for submitting, querying fields.

### Example

```ts
import { renderForm } from '@/test/utils/formTestUtils';
import MyForm from '@/components/MyForm';

it('submits form successfully', async () => {
  const { getByLabelText, submit } = renderForm(<MyForm />);
  fireEvent.change(getByLabelText(/Name/), { target: { value: 'John' } });
  submit('Submit');
  await waitFor(() => expect(screen.getByText(/Success/)).toBeInTheDocument());
});
```

## Test Conventions

- Use `describe`/`it` style with clear names.
- Reset MSW handlers per test via `afterEach`.
- Avoid testing simple logic in E2E; focus on user flows.

