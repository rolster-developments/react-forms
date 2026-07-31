import { act } from 'react';
import { useFormArray } from './form-array/form-array';
import { formArrayControl } from './form-array/form-array-control';
import { formArrayGroup } from './form-array/form-array-group';
import { useFormArrayGroupSelect } from './hooks';
import { renderHook } from './testing';

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

  it('should return the current group when a control value changes', () => {
    const { result } = renderFormArrayGroupSelect();

    act(() => {
      result.current.groupSelect.setFormGroup(
        result.current.formArray.groups[0]
      );
    });

    act(() => {
      result.current.formArray.groups[0].controls.name.setValue('react');
    });

    expect(result.current.groupSelect.formGroup?.value).toEqual({
      name: 'react'
    });
  });

  it('should keep the same select reference when the component re-renders without changes', () => {
    const { rerender, result } = renderFormArrayGroupSelect();

    const groupSelect = result.current.groupSelect;

    rerender();

    expect(result.current.groupSelect).toBe(groupSelect);
  });

  it('should return undefined when the selected group is removed', () => {
    const { result } = renderFormArrayGroupSelect();

    act(() => {
      result.current.groupSelect.setFormGroup(
        result.current.formArray.groups[0]
      );
    });

    act(() => {
      result.current.formArray.remove(result.current.formArray.groups[0]);
    });

    expect(result.current.groupSelect.formGroup).toBeUndefined();
  });
});
