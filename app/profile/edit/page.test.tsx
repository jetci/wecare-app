import '@testing-library/jest-dom/vitest';
import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved } from '@/app/dashboard/test-utils'
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import useSWR, { SWRConfig } from 'swr';
import EditProfilePage from './page';

// Mock next/navigation
// Define top-level mock functions for router methods
const mockRouterPush = vi.fn((...args: any[]) => {
  console.log('[DEBUG] mockRouterPush called with:', ...args);
});
const mockRouterBack = vi.fn();
const mockRouterForward = vi.fn();
const mockRouterRefresh = vi.fn();
const mockRouterReplace = vi.fn();
const mockRouterPrefetch = vi.fn();

// Stable router object for the mock
const stableMockRouter = {
  push: mockRouterPush,
  back: mockRouterBack,
  forward: mockRouterForward,
  refresh: mockRouterRefresh,
  replace: mockRouterReplace,
  prefetch: mockRouterPrefetch,
};

vi.mock('next/navigation', () => ({
  useRouter: () => stableMockRouter, // Always return the same object
  usePathname: () => '/profile/edit', // Default path
  useSearchParams: () => new URLSearchParams(), // Default search params
}));

// Mock react-hot-toast using vi.hoisted
const { 
  mockToastSuccessActualFn, 
  mockToastErrorActualFn, 
  actualToastObjectMock 
} = vi.hoisted(() => {
  const successFn = vi.fn();
  const errorFn = vi.fn();
  return {
    mockToastSuccessActualFn: successFn,
    mockToastErrorActualFn: errorFn,
    actualToastObjectMock: { success: successFn, error: errorFn },
  };
});
vi.mock('react-hot-toast', () => ({
  toast: actualToastObjectMock,
}));

// Mock SWR
let mockSWRData: any = null;
let mockSWRError: any = null;
let mockSWRIsLoading: boolean = false;
const mockSWRMutate = vi.fn(); // Consistent mutate function

vi.mock('swr', async (importOriginal) => {
  const originalSWR = await importOriginal<typeof import('swr')>();
  return {
    ...originalSWR,
    default: vi.fn((key, fetcher, options) => {
      // Handle conditional fetching (key is null or function returning null)
      if (typeof key === 'function' || !key) {
        return { data: undefined, error: undefined, isLoading: false, mutate: mockSWRMutate, isValidating: false };
      }

      // If there's an error, process it and call component's onError if available
      if (mockSWRError) {
        if (options?.onError && typeof options.onError === 'function') {
          options.onError(mockSWRError, key as string, options as any);
        }
        return { data: undefined, error: mockSWRError, isLoading: false, mutate: mockSWRMutate, isValidating: false };
      }

      // If loading state is set
      if (mockSWRIsLoading) {
        return { data: undefined, error: undefined, isLoading: true, mutate: mockSWRMutate, isValidating: true };
      }

      // Otherwise, return mock data
      return { data: mockSWRData, error: undefined, isLoading: false, mutate: mockSWRMutate, isValidating: false };
    }),
  };
});

// Mock global.fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
let store: Record<string, string> = {};
const localStorageMock = (() => {
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Helper to setup SWR mock state
const setupSWRMock = (data: any, errorInput: { message: string, status?: number } | Error | null, isLoading: boolean) => {
  mockSWRData = data;
  if (errorInput) {
    let message = '';
    let status: number | undefined = undefined;

    if (errorInput instanceof Error) {
      message = errorInput.message;
      status = (errorInput as any).status; // Try to preserve status if it's an Error instance
    } else { // It's a plain object
      message = errorInput.message;
      status = errorInput.status;
    }

    // Align message with what the component's fetcher sets for auth errors
    if (status === 401 || status === 403) {
      message = 'Unauthorized or Forbidden';
    }
    
    const newErrInstance = new Error(message);
    (newErrInstance as any).status = status; // Set status on the new instance
    mockSWRError = newErrInstance;

  } else {
    mockSWRError = null;
  }
  mockSWRIsLoading = isLoading;
  mockSWRMutate.mockClear();
};

const initialMockProfile = {
  user: { // Assuming data is nested under 'user' based on page.tsx logic
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    phone: '0812345678',
  },
};

const renderComponent = () => {
  // Import SWRConfig from the mocked 'swr' module if not already available globally in the test scope
  // For this setup, assuming 'swr' mock correctly exports SWRConfig or it's globally available.
  // const { SWRConfig } = await vi.importActual('swr'); // If needed to get actual SWRConfig
  // However, since we mock 'swr', we should use the SWRConfig from the mock if it's part of the mock.
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <EditProfilePage />
    </SWRConfig>
  );
};

describe('EditProfilePage', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    localStorage.clear(); // Clear localStorage before each test
    // Reset all mocks if not already done by vi.clearAllMocks()
    // vi.clearAllMocks(); // This is in the global beforeEach, so it's fine
    // mockFetch.mockClear(); // This is in the global beforeEach
    // mockToastErrorActualFn.mockClear(); // This is in the global beforeEach
    // mockToastSuccess.mockClear(); // This is in the global beforeEach
    // mockRouterPush.mockClear(); // This is in the global beforeEach
    // mockRouterBack.mockClear(); // This is in the global beforeEach
    vi.clearAllMocks(); // This will clear all mocks, including mockRouterPush, toast mocks, etc.

    // Note: mockToastSuccessActualFn, mockToastErrorActualFn (the vi.fn() instances)
    // have their call history cleared by vi.clearAllMocks().
    // The actualToastObjectMock is an object, its properties (success/error vi.fn()s) are handled.

    // Setup SWR and fetch mocks for the test
    setupSWRMock(JSON.parse(JSON.stringify(initialMockProfile)), null, false); // Default successful load
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ message: 'Success' }) });
  });

  describe('Rendering and Initial State', () => {
    it('should render the form with fetched profile data', async () => {
      renderComponent();
      expect(await screen.findByRole('textbox', { name: /ชื่อ/i })).toHaveValue(initialMockProfile.user.firstName);
      expect(await screen.findByRole('textbox', { name: /นามสกุล/i })).toHaveValue(initialMockProfile.user.lastName);
      expect(await screen.findByRole('textbox', { name: /เบอร์โทรศัพท์/i })).toHaveValue(initialMockProfile.user.phone);
      expect(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button')).toBeDisabled(); // Disabled initially
    });

    it('should show loading state', () => {
      setupSWRMock(null, null, true);
      renderComponent();
      expect(screen.getByText(/กำลังโหลดข้อมูลโปรไฟล์.../i)).toBeInTheDocument();
    });

    it('should show error message if fetching profile fails and no data', async () => {
      setupSWRMock(null, { message: 'Network Error' }, false);
      renderComponent();
      expect(await screen.findByText(/ไม่สามารถโหลดข้อมูลโปรไฟล์ได้: Network Error/i)).toBeInTheDocument();
    });

    it('should show "ไม่พบข้อมูลผู้ใช้" if no profile data, no error, and not loading', async () => {
      setupSWRMock(null, null, false);
      renderComponent();
      expect(await screen.findByText(/ไม่พบข้อมูลผู้ใช้/i)).toBeInTheDocument();
    });

    it('should redirect to /login if profile fetch returns Unauthorized (401)', async () => {
      setupSWRMock(null, { message: 'Unauthorized or Forbidden', status: 401 }, false);
      await act(async () => {
        renderComponent();
      });
      await act(async () => {}); // Flush subsequent promises
      await waitFor(() => {
        expect(mockToastErrorActualFn).toHaveBeenCalledWith('กรุณาเข้าสู่ระบบเพื่อแก้ไขข้อมูลส่วนตัว');
        expect(mockRouterPush).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 }); // Reverted timeout
    });

    it('should redirect to /login if profile fetch returns Forbidden (403)', async () => {
      setupSWRMock(null, { message: 'Unauthorized or Forbidden', status: 403 }, false);
      await act(async () => {
        renderComponent();
      });
      await act(async () => {}); // Flush subsequent promises
      await waitFor(() => {
        expect(mockToastErrorActualFn).toHaveBeenCalledWith('กรุณาเข้าสู่ระบบเพื่อแก้ไขข้อมูลส่วนตัว');
        expect(mockRouterPush).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
    });
  });

  describe('Form Validation', () => {
    const user = userEvent.setup();
    beforeEach(async () => {
      // Start with a loaded form for validation tests
      renderComponent();
      await screen.findByLabelText(/ชื่อ/i); // Ensure form is loaded
    });

    it('should require first name', async () => {
      await user.clear(screen.getByRole('textbox', { name: /ชื่อ/i }));
      await user.click(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button'));
      expect(await screen.findByText('ชื่อห้ามว่าง')).toBeInTheDocument();
    });

    it('should require last name', async () => {
      await user.clear(screen.getByRole('textbox', { name: /นามสกุล/i }));
      await user.click(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button'));
      expect(await screen.findByText('นามสกุลห้ามว่าง')).toBeInTheDocument();
    });

    it('should require phone number and validate length (10 digits)', async () => {
      const phoneInput = screen.getByRole('textbox', { name: /เบอร์โทรศัพท์/i });
      await user.clear(phoneInput);
      await user.click(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button'));
      expect(await screen.findByText('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก')).toBeInTheDocument();

      await user.type(phoneInput, '123');
      await user.click(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button'));
      expect(await screen.findByText('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก')).toBeInTheDocument();
    });

    it('should validate phone number contains only digits', async () => {
      const phoneInput = screen.getByRole('textbox', { name: /เบอร์โทรศัพท์/i });
      await user.clear(phoneInput);
      await user.type(phoneInput, 'abcdefghij');
      await user.click(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button'));
      expect(await screen.findByText('เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น')).toBeInTheDocument();
    });

    it('should be valid with correct inputs', async () => {
      const phoneInput = screen.getByRole('textbox', { name: /เบอร์โทรศัพท์/i });
      await user.clear(phoneInput);
      await user.type(phoneInput, '0987654321');
      // Assuming firstName and lastName are already valid from initial load
      expect(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button')).toBeEnabled();
    });
  });

  describe('Form Submission (Save)', () => {
    beforeEach(() => {
      // For these tests, assume the user is 'logged in' for the API call
      localStorage.setItem('accessToken', 'test-access-token');
    });

    afterEach(() => {
      localStorage.removeItem('accessToken'); // Clean up specifically for this group if needed
    });
    const user = userEvent.setup();
    const updatedProfile = {
      firstName: 'สมศรี',
      lastName: 'แข็งแรง',
      phone: '0998887777',
    };

    beforeEach(async () => {
      renderComponent();
      await screen.findByLabelText(/ชื่อ/i); // Ensure form is loaded
      await user.clear(screen.getByRole('textbox', { name: /ชื่อ/i }));
      await user.type(screen.getByRole('textbox', { name: /ชื่อ/i }), updatedProfile.firstName);
      await user.clear(screen.getByRole('textbox', { name: /นามสกุล/i }));
      await user.type(screen.getByRole('textbox', { name: /นามสกุล/i }), updatedProfile.lastName);
      await user.clear(screen.getByRole('textbox', { name: /เบอร์โทรศัพท์/i }));
      await user.type(screen.getByRole('textbox', { name: /เบอร์โทรศัพท์/i }), updatedProfile.phone);
    });

    it('should submit updated data, show success toast, and redirect on successful API call', async () => {
      mockFetch.mockResolvedValueOnce({ 
        ok: true, 
        json: () => Promise.resolve({ message: 'Profile updated successfully' }),
      });

      await user.click(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/user/update-profile', {
          method: 'PUT',
          headers: { Authorization: expect.stringContaining('Bearer ') },
          body: expect.any(FormData),
        });
        expect(mockToastSuccessActualFn).toHaveBeenCalledWith('โปรไฟล์ถูกอัปเดตเรียบร้อยแล้ว');
        expect(mockRouterPush).toHaveBeenCalledWith('/profile');
      });
    });

    it('should show error toast and not redirect on failed API call', async () => {
      const baseErrorMessage = 'Network Error';
      const expectedToastMessage = baseErrorMessage; // Should be the direct error message from the API
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: baseErrorMessage }),
        status: 500,
      });

      // Make the form dirty to enable the save button
      const firstNameInput = screen.getByRole('textbox', { name: /ชื่อ/i });
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'ชื่อทดสอบใหม่'); // Change value to make it dirty

      const saveButton = within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button');
      expect(saveButton).not.toBeDisabled(); // Ensure button is enabled
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockToastErrorActualFn).toHaveBeenCalledWith(expectedToastMessage);
      });
      // Check fetch called with FormData
      expect(mockFetch).toHaveBeenCalledWith('/api/user/update-profile', {
        method: 'PUT',
        headers: { Authorization: expect.stringContaining('Bearer ') },
        body: expect.any(FormData),
      });
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Functionality', () => {
    const user = userEvent.setup();
    beforeEach(async () => {
      renderComponent();
      await screen.findByLabelText(/ชื่อ/i); // Ensure form is loaded
    });

    it('should reset form to last fetched data and disable save button', async () => {
      // Get form elements
      const firstNameInput = screen.getByRole('textbox', { name: /ชื่อ/i });
      const lastNameInput = screen.getByRole('textbox', { name: /นามสกุล/i });
      const phoneInput = screen.getByRole('textbox', { name: /เบอร์โทรศัพท์/i });
      const saveButton = within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button');

      // Initially, save button should be disabled as form is pristine
      expect(saveButton).toBeDisabled();

      // Modify form fields to make it dirty
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'ชื่อใหม่');
      await user.clear(lastNameInput);
      await user.type(lastNameInput, 'นามสกุลใหม่');
      await user.clear(phoneInput);
      await user.type(phoneInput, '0987654321'); // Valid format and length

      // Save button should be enabled after changes and if form is valid
      // Depending on exact validation, this might need adjustment or specific valid inputs
      await waitFor(() => expect(saveButton).not.toBeDisabled());

      // Click the cancel button
      await act(async () => {
        await user.click(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('cancel-button'));
      });

      await act(async () => {}); // Flush promises

      // Assert that form fields are reset and save button is disabled
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /ชื่อ/i })).toHaveValue(initialMockProfile.user.firstName);
        expect(screen.getByRole('textbox', { name: /นามสกุล/i })).toHaveValue(initialMockProfile.user.lastName);
        expect(screen.getByRole('textbox', { name: /เบอร์โทรศัพท์/i })).toHaveValue(initialMockProfile.user.phone);
        // Re-query the button inside waitFor to get its latest state
        expect(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button')).toBeDisabled();
      }, { timeout: 3000 });
    });

    it('should show error when no document selected', async () => {
      renderComponent();
      const user = userEvent.setup();
      // Ensure form loaded
      await screen.findByRole('textbox', { name: /ชื่อ/i });
      await user.click(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button'));
      expect(await screen.findByText(/กรุณาเลือกไฟล์เอกสาร/)).toBeInTheDocument();
    });

    it('should show error when document type is invalid', async () => {
      renderComponent();
      const user = userEvent.setup();
      // Wait for form load
      await screen.findByRole('textbox', { name: /ชื่อ/i });
      const file = new File(['dummy'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/เอกสารผู้ป่วย/i) as HTMLInputElement;
      await user.upload(input, file);
      await user.click(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('save-button'));
      expect(await screen.findByText(/ไฟล์ต้องเป็น PDF หรือรูปภาพ/)).toBeInTheDocument();
    });

    it('should reset form fields and document input on cancel', async () => {
      renderComponent();
      const user = userEvent.setup();
      // Wait and modify fields
      const firstNameInput = await screen.findByRole('textbox', { name: /ชื่อ/i });
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Test');
      const docFile = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
      const docInput = screen.getByLabelText(/เอกสารผู้ป่วย/i) as HTMLInputElement;
      await user.upload(docInput, docFile);
      // Click cancel
      await user.click(within(screen.getAllByTestId('edit-profile-form')[0]).getByTestId('cancel-button'));
      // Original values restored
      expect(firstNameInput).toHaveValue(initialMockProfile.user.firstName);
      expect(docInput.files?.length).to.equal(0);
    });
  });
});

