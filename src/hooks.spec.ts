import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { useFormArray } from './form-array/form-array';
import { formArrayControl } from './form-array/form-array-control';
import { formArrayGroup } from './form-array/form-array-group';
import { useFormArrayGroupSelect } from './hooks';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function renderHook<T>(useHook: () => T) {
  const result = { current: undefined as unknown as T };

  function HookHost() {
    result.current = useHook();

    return null;
  }

  const root = createRoot(document.createElement('div'));

  act(() => {
    root.render(createElement(HookHost));
  });

  return {
    result,
    unmount: () => {
      act(() => {
        root.unmount();
      });
    }
  };
}

function renderFormArrayGroupSelect() {
  const group = formArrayGroup({
    controls: { name: formArrayControl('rolster') }
  });

  return renderHook(() => {
    const formArray = useFormArray([group]);
    const groupSelect = useFormArrayGroupSelect({ formArray });

    return { formArray, groupSelect };
  });
}

describe('useFormArrayGroupSelect', () => {
  it('should return the selected group of the form array', () => {
    const { result } = renderFormArrayGroupSelect();

    expect(result.current.groupSelect.formGroup).toBeUndefined();

    act(() => {
      result.current.groupSelect.setFormGroup(
        result.current.formArray.groups[0]
      );
    });

    expect(result.current.groupSelect.formGroup).toBe(
      result.current.formArray.groups[0]
    );
  });

  it('should return the current group when a control changes without changing value', () => {
    const { result } = renderFormArrayGroupSelect();

    act(() => {
      result.current.groupSelect.setFormGroup(
        result.current.formArray.groups[0]
      );
    });

    act(() => {
      result.current.formArray.groups[0].controls.name.touch();
    });

    expect(result.current.formArray.groups[0].touched).toBe(true);
    expect(result.current.groupSelect.formGroup).toBe(
      result.current.formArray.groups[0]
    );
    expect(result.current.groupSelect.formGroup?.touched).toBe(true);
  });
});
