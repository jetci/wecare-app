import '@testing-library/jest-dom/vitest';
import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import '@testing-library/jest-dom';
import NewPatientPage from './page';
import { useForm, FormProvider } from 'react-hook-form';
import { useNewPatientForm } from './useNewPatientForm';
import { useDirtyCheck } from './useDirtyCheck';
import { vi } from 'vitest';
import { validateImage, compressImage } from '@/utils/image';

// Mock hooks
vi.mock('./useDirtyCheck', () => ({ useDirtyCheck: () => {} }));

vi.mock('./useNewPatientForm', () => ({
  useNewPatientForm: () => {
    const methods = useForm({ defaultValues: { prefix: '', firstName: '', lastName: '', nationalId: '', phone: '', dob: new Date(), age: 0, photo: undefined, addrNo: '', addrMoo: '', villageName: '', copyAddr: false, currNo: '', currMoo: '', currVillageName: '', currSub: '', currDist: '', currProv: '', patientGroup: '', otherGroup: '', statusHelpSelf: false, statusCannotHelpSelf: false, needTool: false, toolRemark: '', remark: '', docCertHead: undefined, docCertBed: undefined, docAppointment: undefined, docOther: undefined, latitude: '', longitude: '', locationLabel: '' } });
    return { ...methods, trigger: methods.trigger, formState: { ...methods.formState, isSubmitting: false, isDirty: false } };
  }
}));

// Mock utils
vi.mock('../../../../../utils/image', () => ({
  validateImage: vi.fn(() => true),
  compressImage: vi.fn(async (file: File) => file),
}));

// Override URL.createObjectURL
const createObjectURL = global.URL.createObjectURL;
beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob://preview');
});
afterAll(() => {
  global.URL.createObjectURL = createObjectURL;
});

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('NewPatientPage Unit', () => {
  beforeEach(() => {
    // mock geolocation
    vi.stubGlobal('navigator.geolocation', {
      getCurrentPosition: (success: any) =>
        success({ coords: { latitude: 0, longitude: 0 } } as GeolocationPosition),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    });
  });

  it('renders form fields and reset button', async () => {
    render(
      <Wrapper>
        <NewPatientPage />
      </Wrapper>,
      { role: 'COMMUNITY' }
    );
    expect(screen.getByRole('combobox', { name: /คำนำหน้า/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /รีเซ็ต/ })).toBeInTheDocument();
  });

  it('shows validation errors on submit without required fields', async () => {
    render(
      <Wrapper>
        <NewPatientPage />
      </Wrapper>,
      { role: 'COMMUNITY' }
    );
    fireEvent.click(screen.getByRole('button', { name: /ตรวจสอบข้อมูล/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/กรุณาเลือกคำนำหน้า/)[0]).toBeVisible();
      expect(screen.getAllByText(/กรุณากรอกชื่อ/)[0]).toBeVisible();
      expect(screen.getAllByText(/กรุณากรอกนามสกุล/)[0]).toBeVisible();
    });
  });

  it('reset button clears the form', async () => {
    render(
      <Wrapper>
        <NewPatientPage />
      </Wrapper>,
      { role: 'COMMUNITY' }
    );
    const firstName = screen.getByRole('textbox', { name: /ชื่อ/ });
    fireEvent.change(firstName, { target: { value: 'Test' } });
    fireEvent.click(screen.getByRole('button', { name: /รีเซ็ต/ }));
    expect((firstName as HTMLInputElement).value).to.equal('');
  });
});

describe('NewPatientPage Image Preview & Redirect', () => {
  it('uploads image preview and redirects with params', async () => {
    const mockUpload = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ url: 'uploaded.jpg' }) });
    global.fetch = mockUpload as any;

    render(
      <Wrapper>
        <NewPatientPage />
      </Wrapper>,
      { role: 'COMMUNITY' }
    );
    const file = new File(['img'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/เพิ่ม หนังสือรับรองผู้ป่วยติดเตียง/);
    fireEvent.change(input, { target: { files: [file] } });
    expect(validateImage).toHaveBeenCalledWith(file);
    await waitFor(() => expect(screen.getByAltText('preview')).toHaveAttribute('src', 'blob://preview'));

    // Submit preview (button text 'ตรวจสอบข้อมูล')
    fireEvent.click(screen.getByRole('button', { name: /ตรวจสอบข้อมูล/i }));
    await waitFor(() => expect(mockUpload).toHaveBeenCalled());
    // Expect window.location.href includes uploaded.jpg
    expect(window.location.href).to.include('photo=uploaded.jpg');
  });
});

