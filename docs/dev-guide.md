# Developer Guide

This guide covers key conventions and workflows for forms, testing, and API mocks in **wecare-app**.

---

## 1. Form Development

We use **React Hook Form** + **Zod** for type-safe forms:

1. **Schema**: Define a Zod schema in `src/schemas/...`. Example:
   ```ts
   export const patientFormSchema = z.object({
     firstName: z.string().min(1),
     // ...
   });
   export type PatientFormData = z.infer<typeof patientFormSchema>;
   ```

2. **Component**: Use `useForm<T>()` with `zodResolver`:
   ```ts
   const { register, handleSubmit, formState } = useForm<PatientFormData>({
     resolver: zodResolver(patientFormSchema),
     mode: 'onBlur',
   });
   ```

3. **Props Typing**: Extract component props into `interface` and use `FC<Props>`.
4. **Error Handling**: Display `errors.field?.message` for feedback.

---

## 2. Testing Conventions

All tests live under `src/test/`:

- **Unit & Integration**: `*.spec.tsx` with **Vitest** + **Testing Library**.
- **E2E**: `cypress/e2e/*.cy.ts` using **Cypress**.

### Folder Structure
```
src/test/
  mocks/       # MSW handlers & server setup
  utils/       # renderWithProviders, form utils
  AddPatientModal.spec.tsx
  CommunityDashboardPage.spec.tsx
  useDriverCases.spec.ts
README.md      # this folder's test guide
```

### Naming
- **Unit/Integration**: `<Component|HookName>.spec.tsx`
- **E2E**: `<feature>.cy.ts`

### Running Tests
```bash
yarn test         # all unit tests (Vitest)
yarn test:e2e     # Cypress tests
yarn test:community-all  # custom script for community dashboard group
```

---

## 3. API Mocking (MSW)

We use **Mock Service Worker** to simulate backend in component tests:

1. **Handlers**: Define in `src/test/mocks/handlers.ts`:
   ```ts
   rest.get('/api/patients', (req, res, ctx) => ...);
   ```
2. **Server**: Setup in `src/test/mocks/server.ts`:
   ```ts
   import { setupServer } from 'msw/node';
   export const server = setupServer(...handlers);
   ```
3. **Vitest Setup**: In `src/test/vitest.setup.ts`, start/stop server.

---

## 4. Mocking Auth & Permissions

To test guarded routes/components:

- **Mock `useAuth`**:
  ```ts
  vi.mock('@/context/AuthContext', () => ({
    useAuth: () => ({ token: 'abc', user: { id: '123', role: 'ADMIN' } }),
  }));
  ```

- **PermissionGuard**: Test redirect/render based on `session.role` and `NEXT_PUBLIC_DEV_USER_ID`.

---

## 5. Conventions & Best Practices

- **No `any`/`unknown`**: Always infer from Zod schemas.
- **Props & Handlers**: Use explicit `interface` and `FC<...>`.
- **Tests**: Reset mocks and cleanup after each test.
- **Environment**: Store keys in `.env.local` with `NEXT_PUBLIC_` prefix for frontend.

---

_For detailed test conventions, see `src/test/README.md`._
