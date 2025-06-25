import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportsPage from './page';

describe('ReportsPage Schedule Modal', () => {
  beforeEach(() => {
    render(<ReportsPage />);
  });

  it('opens modal on click and resets defaults', async () => {
    const openBtn = screen.getByTestId('schedule-open-button');
    fireEvent.click(openBtn);
    expect(await screen.findByTestId('schedule-modal')).toBeInTheDocument();
    const emailInput = screen.getByTestId('schedule-email-input');
    const freqSelect = screen.getByTestId('schedule-frequency-select');
    expect(emailInput).toHaveValue('');
    expect(freqSelect).toHaveValue('daily');
  });

  it('closes modal on cancel and Esc', async () => {
    fireEvent.click(screen.getByTestId('schedule-open-button'));
    await screen.findByTestId('schedule-modal');
    fireEvent.click(screen.getByTestId('schedule-cancel-button'));
    await waitFor(() => expect(screen.queryByTestId('schedule-modal')).toBeNull());
    // reopen and press Escape
    fireEvent.click(screen.getByTestId('schedule-open-button'));
    await screen.findByTestId('schedule-modal');
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByTestId('schedule-modal')).toBeNull());
  });

  it('shows validation error on invalid email', async () => {
    fireEvent.click(screen.getByTestId('schedule-open-button'));
    const emailInput = await screen.findByTestId('schedule-email-input');
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(screen.getByTestId('schedule-submit-button'));
    expect(await screen.findByTestId('schedule-error')).toHaveTextContent('กรุณาระบุอีเมลให้ถูกต้อง');
  });

  it('submits successfully and closes modal', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    fireEvent.click(screen.getByTestId('schedule-open-button'));
    const emailInput = await screen.findByTestId('schedule-email-input');
    const freqSelect = screen.getByTestId('schedule-frequency-select');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(freqSelect, { target: { value: 'weekly' } });
    fireEvent.click(screen.getByTestId('schedule-submit-button'));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/reports/schedule', expect.any(Object)));
    await waitFor(() => expect(screen.queryByTestId('schedule-modal')).toBeNull());
  });

  it('shows server error on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    fireEvent.click(screen.getByTestId('schedule-open-button'));
    const emailInput = await screen.findByTestId('schedule-email-input');
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByTestId('schedule-submit-button'));
    expect(await screen.findByTestId('schedule-error')).toHaveTextContent('ไม่สามารถตั้งเวลาได้ กรุณาลองใหม่');
  });
});
