import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Submit } from '../src/components/Submit';
import * as geminiService from '../src/services/geminiService';

vi.mock('../src/services/geminiService', () => ({
  analyzeSentiment: vi.fn(),
}));

describe('Submit Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not trigger submission if text area is empty', async () => {
    render(<Submit />);
    
    const submitButton = screen.getByText(/Transmit Signal/i);
    fireEvent.click(submitButton);

    expect(geminiService.analyzeSentiment).not.toHaveBeenCalled();
  });

  it('should transition through submission lifecycle correctly', async () => {
    let resolveSentiment: any;
    const sentimentPromise = new Promise((resolve) => {
      resolveSentiment = resolve;
    });
    (geminiService.analyzeSentiment as any).mockReturnValue(sentimentPromise);
    
    render(<Submit />);
    
    const textarea = screen.getByPlaceholderText(/Spill the tea here/i);
    await userEvent.type(textarea, 'This is a great place to work!');
    
    const submitButton = screen.getByText(/Transmit Signal/i);
    
    // Trigger submit
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    // Check analyzing state
    expect(screen.getAllByText(/ANALYZING_SENTIMENT/i).length).toBeGreaterThan(0);
    
    // Resolve the promise
    await act(async () => {
      resolveSentiment('POSITIVE');
    });
    
    // Check final state
    await waitFor(() => {
      expect(screen.getByText('SIGNAL_DELIVERED')).toBeInTheDocument();
    });
  });

  it('should persist data to localStorage correctly', async () => {
    (geminiService.analyzeSentiment as any).mockResolvedValue('POSITIVE');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    render(<Submit />);
    
    const textarea = screen.getByPlaceholderText(/Spill the tea here/i);
    await userEvent.type(textarea, 'This is a great place to work!');
    
    const submitButton = screen.getByText(/Transmit Signal/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('SIGNAL_DELIVERED')).toBeInTheDocument();
    });
    
    expect(setItemSpy).toHaveBeenCalledWith(
      'pulse_feedback',
      expect.stringContaining('"sentiment":"POSITIVE"')
    );
    expect(setItemSpy).toHaveBeenCalledWith(
      'pulse_feedback',
      expect.stringContaining('"text":"This is a great place to work!"')
    );
    expect(setItemSpy).toHaveBeenCalledWith(
      'pulse_feedback',
      expect.stringContaining('"isAnonymous":true')
    );
  });

  it('should display TRANSMISSION_FAILED and reset on error simulation', async () => {
    (geminiService.analyzeSentiment as any).mockResolvedValue('NEGATIVE');
    
    render(<Submit />);
    
    const textarea = screen.getByPlaceholderText(/Spill the tea here/i);
    await userEvent.type(textarea, 'This is an error message');
    
    const submitButton = screen.getByText(/Transmit Signal/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getAllByText('TRANSMISSION_FAILED').length).toBeGreaterThan(0);
    });
    
    act(() => {
      vi.runAllTimers();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Transmit Signal/i)).toBeInTheDocument();
    });
  });
});
