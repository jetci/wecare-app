import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';

describe('AuthContext', () => {
  const Tester = () => {
    const { user, role, isAuthenticated, isAdmin, isGuest, setRole } = useAuth();
    return (
      <>
        <div data-testid="user">{user ? user.name : 'null'}</div>
        <div data-testid="role">{role || 'null'}</div>
        <div data-testid="isAuth">{isAuthenticated ? 'true' : 'false'}</div>
        <div data-testid="isAdmin">{isAdmin ? 'true' : 'false'}</div>
        <div data-testid="isGuest">{isGuest ? 'true' : 'false'}</div>
        <button onClick={() => setRole('ADMIN')} data-testid="set-admin">setRole</button>
      </>
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('default unauthenticated state', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    render(
      <AuthProvider>
        <Tester />
      </AuthProvider>
    );
    // wait for useEffect
    await waitFor(() => expect(screen.getByTestId('isAuth')).toHaveTextContent('false'));
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('role')).toHaveTextContent('null');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
    expect(screen.getByTestId('isGuest')).toHaveTextContent('true');
  });

  it('fetches profile and sets context', async () => {
    const mockUser = { id: '1', name: 'Alice', role: 'ADMIN' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });
    render(
      <AuthProvider>
        <Tester />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('role')).toHaveTextContent('ADMIN'));
    expect(screen.getByTestId('user')).toHaveTextContent('Alice');
    expect(screen.getByTestId('isAuth')).toHaveTextContent('true');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
    expect(screen.getByTestId('isGuest')).toHaveTextContent('false');
  });

  it('setRole updates context', async () => {
    const mockUser = { id: '2', name: 'Bob', role: 'USER' };
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockUser });
    render(
      <AuthProvider>
        <Tester />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('role')).toHaveTextContent('USER'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('set-admin'));
    });
    expect(screen.getByTestId('role')).toHaveTextContent('ADMIN');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
  });
});
