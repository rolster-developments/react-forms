import { ValidatorFn } from '@rolster/validators';
import { act } from 'react';
import { renderHook } from '../testing';
import { useFormList, useReactList } from './form-list';

const minTwoItems: ValidatorFn<string[]> = (value) =>
  value && value.length >= 2
    ? undefined
    : { id: 'minItems', message: 'List requires at least 2 items' };

describe('useFormList', () => {
  it('should create a list with an empty array by default', () => {
    const { result } = renderHook(() => useFormList<string>());

    expect(result.current.value).toEqual([]);
    expect(result.current.dirty).toBe(false);
    expect(result.current.valid).toBe(true);
  });

  it('should create a list with the initial value', () => {
    const { result } = renderHook(() => useFormList(['react', 'angular']));

    expect(result.current.value).toEqual(['react', 'angular']);
  });

  it('should create a list with the value of a factory', () => {
    const { result } = renderHook(() => useFormList(() => ['react']));

    expect(result.current.value).toEqual(['react']);
  });

  it('should invoke the factory of the value only on the first render', () => {
    let invocations = 0;

    const { rerender, result } = renderHook(() =>
      useFormList(() => {
        invocations++;

        return ['react'];
      })
    );

    act(() => {
      result.current.push('angular');
    });

    rerender();

    expect(invocations).toBe(1);
    expect(result.current.value).toEqual(['react', 'angular']);
  });

  describe('push', () => {
    it('should add the item to the list and mark it as dirty', () => {
      const { result } = renderHook(() => useFormList<string>());

      act(() => {
        result.current.push('react');
      });

      expect(result.current.value).toEqual(['react']);
      expect(result.current.dirty).toBe(true);

      act(() => {
        result.current.push('angular');
      });

      expect(result.current.value).toEqual(['react', 'angular']);
    });

    it('should add all the items when push is called several times in the same tick', () => {
      const { result } = renderHook(() => useFormList<string>());

      act(() => {
        result.current.push('react');
        result.current.push('angular');
      });

      expect(result.current.value).toEqual(['react', 'angular']);
    });
  });

  describe('remove', () => {
    it('should remove the item from the list', () => {
      const { result } = renderHook(() => useFormList(['react', 'angular']));

      act(() => {
        result.current.remove('react');
      });

      expect(result.current.value).toEqual(['angular']);
    });

    it('should not change the state when the item does not exist', () => {
      const { result } = renderHook(() => useFormList(['react']));

      act(() => {
        result.current.remove('angular');
      });

      expect(result.current.value).toEqual(['react']);
      expect(result.current.dirty).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all the items from the list', () => {
      const { result } = renderHook(() => useFormList(['react', 'angular']));

      act(() => {
        result.current.clear();
      });

      expect(result.current.value).toEqual([]);
      expect(result.current.dirty).toBe(true);
    });

    it('should not change the state when the list is empty', () => {
      const { result } = renderHook(() => useFormList<string>());

      act(() => {
        result.current.clear();
      });

      expect(result.current.value).toEqual([]);
      expect(result.current.dirty).toBe(false);
    });
  });

  describe('validators', () => {
    it('should evaluate validators over the list value', () => {
      const { result } = renderHook(() =>
        useFormList(['react'], [minTwoItems])
      );

      expect(result.current.valid).toBe(false);
      expect(result.current.error?.id).toBe('minItems');

      act(() => {
        result.current.push('angular');
      });

      expect(result.current.valid).toBe(true);
    });
  });
});

describe('useFormList memoization', () => {
  it('should keep stable references of the list methods across renders', () => {
    const { result } = renderHook(() => useFormList<string>());

    const { clear, push, remove } = result.current;

    act(() => {
      result.current.push('react');
    });

    expect(result.current.push).toBe(push);
    expect(result.current.remove).toBe(remove);
    expect(result.current.clear).toBe(clear);
  });

  it('should keep the same list reference when the component re-renders without changes', () => {
    const { rerender, result } = renderHook(() => useFormList(['react']));

    const formList = result.current;

    rerender();

    expect(result.current).toBe(formList);
  });
});

describe('useReactList', () => {
  it('should create a list with an element reference', () => {
    const { result } = renderHook(() =>
      useReactList<HTMLElement, string>(['react'])
    );

    expect(result.current.value).toEqual(['react']);
    expect(result.current.elementRef?.current).toBeNull();
  });
});
