import { render, fireEvent } from '@testing-library/react';
import { ReactElement } from 'react';
import { renderWithProviders } from './renderWithProviders';

/**
 * Renders a form component within providers and returns form utilities.
 */
export function renderForm(component: ReactElement) {
  const utils = renderWithProviders(component);
  const { container, getByLabelText, getByText } = utils;
  return {
    ...utils,
    container,
    getByLabelText,
    getByText,
    submit: (submitButtonText: string) => {
      fireEvent.click(getByText(submitButtonText));
    },
  };
}
