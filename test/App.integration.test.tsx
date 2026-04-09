import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import * as geminiService from '../src/services/geminiService';

vi.mock('../src/services/geminiService', () => ({
  analyzeSentiment: vi.fn(),
  generateInsightsReport: vi.fn(),
}));

describe('App Integration - Full User Journey', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Seed initial tickets to have a known state
    const initialTickets = [
      {
        id: "#TKT-0001",
        dept: "[MKT]",
        title: "Initial Ticket",
        status: "QUEUED",
        time: "10 DAYS",
      }
    ];
    localStorage.setItem('glassbox_tickets', JSON.stringify(initialTickets));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should complete the full user journey: login -> submit -> dashboard', async () => {
    // 1. Render <App /> and use userEvent.click() on the Login button.
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    const loginButton = screen.getByText(/Continue with SSO/i);
    await userEvent.click(loginButton);
    
    // 2. Assert that the view changes to the Dashboard.
    await waitFor(() => {
      expect(screen.getByText(/Open Tickets/i)).toBeInTheDocument();
    });
    
    // Assert initial open tickets count is 01
    await waitFor(() => {
      expect(screen.getAllByText('01')[0]).toBeInTheDocument();
    });
    
    // 3. Simulate clicking the navigation to go to the Submit view.
    const newSignalButton = screen.getAllByText(/New Signal/i)[0];
    await userEvent.click(newSignalButton);
    
    // Wait for Submit view to render
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Spill the tea here/i)).toBeInTheDocument();
    });
    
    // 4. Use userEvent.type() to enter a mock complaint into the text area.
    const textarea = screen.getByPlaceholderText(/Spill the tea here/i);
    await userEvent.type(textarea, 'This is a test complaint about the coffee machine.');
    
    // 5. Click the "Transmit Signal" button.
    // Mock the API response
    let resolveSentiment: any;
    const sentimentPromise = new Promise((resolve) => {
      resolveSentiment = resolve;
    });
    (geminiService.analyzeSentiment as any).mockReturnValue(sentimentPromise);
    
    const submitButton = screen.getByText(/Transmit Signal/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // 6. Wait for the mocked API to resolve and assert that the simulated localStorage now contains the new payload.
    await act(async () => {
      resolveSentiment('NEGATIVE');
    });
    
    await waitFor(() => {
      expect(screen.getByText('SIGNAL_DELIVERED')).toBeInTheDocument();
    });
    
    // Check localStorage
    const pulseFeedback = JSON.parse(localStorage.getItem('pulse_feedback') || '[]');
    expect(pulseFeedback.length).toBe(1);
    expect(pulseFeedback[0].text).toBe('This is a test complaint about the coffee machine.');
    
    const glassboxTickets = JSON.parse(localStorage.getItem('glassbox_tickets') || '[]');
    expect(glassboxTickets.length).toBe(2); // 1 initial + 1 new
    expect(glassboxTickets[0].title).toBe('This is a test complaint about the coffee machine.');
    
    // 7. Simulate navigating back to the Dashboard view.
    const dashboardButton = screen.getAllByText(/Dashboard/i)[0];
    await userEvent.click(dashboardButton);
    
    // 8. Assert that the "Open Tickets" DOM element has updated its text content (e.g., from "01" to "02") 
    // and that the new ticket title appears in the Live Feed ticker.
    await waitFor(() => {
      expect(screen.getByText(/Open Tickets/i)).toBeInTheDocument();
    });
    
    // The count should now be 02
    await waitFor(() => {
      expect(screen.getAllByText('02')[0]).toBeInTheDocument();
    });
    
    // The new ticket title should appear in the Live Feed ticker
    expect(screen.getAllByText(/This is a test complaint about the coffee machine\./i)[0]).toBeInTheDocument();
  });
});
