import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAutosave } from './useAutosave';

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should initialize with saved status', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useAutosave({ onSave }));

    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('should update status to unsaved when content changes', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useAutosave({ onSave }));

    act(() => {
      result.current.updateContent('new content');
    });

    expect(result.current.saveStatus).toBe('unsaved');
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it('should set up autosave timer when content changes', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useAutosave({ onSave, delay: 1000 }));

    act(() => {
      result.current.updateContent('new content');
    });

    expect(result.current.saveStatus).toBe('unsaved');
    expect(vi.getTimerCount()).toBe(1);
  });

  it('should debounce multiple content changes', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useAutosave({ onSave, delay: 1000 }));

    act(() => {
      result.current.updateContent('content 1');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      result.current.updateContent('content 2');
    });

    // Should have cleared the first timer and set a new one
    expect(vi.getTimerCount()).toBe(1);
  });

  it('should not autosave when disabled', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useAutosave({ onSave, enabled: false }));

    act(() => {
      result.current.updateContent('new content');
    });

    expect(result.current.saveStatus).toBe('unsaved');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should provide triggerSave function', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useAutosave({ onSave }));

    expect(typeof result.current.triggerSave).toBe('function');
  });

  it('should clear timer when triggerSave is called', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() => useAutosave({ onSave, delay: 1000 }));

    act(() => {
      result.current.updateContent('new content');
    });

    expect(vi.getTimerCount()).toBe(1);

    act(() => {
      result.current.triggerSave();
    });

    expect(vi.getTimerCount()).toBe(0);
  });
});