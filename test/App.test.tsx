import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

// Mock the components to isolate App's routing logic
vi.mock('../src/components/Login', () => ({
  Login: ({ onLogin }: { onLogin: () => void }) => (
    <div data-testid="login-view">
      <button onClick={onLogin}>Login</button>
    </div>
  ),
}));

vi.mock('../src/components/Dashboard', () => ({
  Dashboard: ({ onFilterClick }: { onFilterClick: (filter: any) => void }) => (
    <div data-testid="dashboard-view">
      <button onClick={() => onFilterClick({ status: 'QUEUED' })}>Filter Queued</button>
    </div>
  ),
}));

vi.mock('../src/components/Grid', () => ({
  Grid: ({ initialFilter }: { initialFilter: any }) => (
    <div data-testid="grid-view">
      <span data-testid="filter-status">{initialFilter?.status || 'none'}</span>
    </div>
  ),
}));

vi.mock('../src/components/Metrics', () => ({
  Metrics: ({ onFilterClick }: { onFilterClick: (filter: any) => void }) => (
    <div data-testid="metrics-view">
      <button onClick={() => onFilterClick({ dept: '[ENG]' })}>Filter Eng</button>
    </div>
  ),
}));

vi.mock('../src/components/Submit', () => ({
  Submit: () => <div data-testid="submit-view">Submit View</div>,
}));

vi.mock('../src/components/OnboardingTour', () => ({
  OnboardingTour: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="onboarding-tour">
      <button onClick={onComplete}>Complete Tour</button>
    </div>
  ),
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should boot into the login view initially', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('login-view')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-view')).not.toBeInTheDocument();
  });

  it('should update currentView to dashboard and showTour to true on login', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    // Click login button
    fireEvent.click(screen.getByText('Login'));
    
    // Verify view changed to dashboard
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
    });
    
    // Verify onboarding tour is shown
    expect(screen.getByTestId('onboarding-tour')).toBeInTheDocument();
  });

  it('should propagate filter and switch to grid view when filter is clicked in Dashboard', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    // Login to get to dashboard
    fireEvent.click(screen.getByText('Login'));
    
    // Wait for dashboard to render
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
    });
    
    // Click filter button in dashboard
    fireEvent.click(screen.getByText('Filter Queued'));
    
    // Verify view changed to grid
    await waitFor(() => {
      expect(screen.getByTestId('grid-view')).toBeInTheDocument();
    });
    
    // Verify filter was passed correctly
    expect(screen.getByTestId('filter-status')).toHaveTextContent('QUEUED');
  });
});
