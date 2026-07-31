import { ValidatorArrayFn } from '@rolster/forms';
import { act } from 'react';
import { renderHook } from '../testing';
import { useFormArray } from './form-array';
import { formArrayControl } from './form-array-control';
import { formArrayGroup } from './form-array-group';
import { ReactHtmlArrayControl } from './form-array-control.type';

interface ContactControls {
  name: ReactHtmlArrayControl<string>;
  [key: string]: ReactHtmlArrayControl<string>;
}

function createContactGroup(name: string, uuid?: string) {
  return formArrayGroup<ContactControls>({
    controls: { name: formArrayControl(name) },
    uuid
  });
}

const minTwoGroups: ValidatorArrayFn<ContactControls> = (groups) =>
  groups.length >= 2
    ? undefined
    : { id: 'minGroups', message: 'Array requires at least 2 groups' };

describe('useFormArray', () => {
  describe('initial state', () => {
    it('should create an empty array without arguments', () => {
      const { result } = renderHook(() => useFormArray<ContactControls>());

      expect(result.current.groups).toEqual([]);
      expect(result.current.value).toEqual([]);
      expect(result.current.controls).toEqual([]);
      expect(result.current.dirty).toBe(false);
      expect(result.current.touched).toBe(false);
      expect(result.current.valid).toBe(true);
    });

    it('should create an array with the initial groups', () => {
      const { result } = renderHook(() =>
        useFormArray<ContactControls>([
          createContactGroup('rolster'),
          createContactGroup('react')
        ])
      );

      expect(result.current.groups.length).toBe(2);
      expect(result.current.value).toEqual([
        { name: 'rolster' },
        { name: 'react' }
      ]);
    });
  });

  describe('push', () => {
    it('should add the group to the array', () => {
      const { result } = renderHook(() => useFormArray<ContactControls>());

      act(() => {
        result.current.push(createContactGroup('rolster'));
      });

      expect(result.current.groups.length).toBe(1);
      expect(result.current.value).toEqual([{ name: 'rolster' }]);
    });

    it('should synchronize changes of the controls of a pushed group', () => {
      const { result } = renderHook(() => useFormArray<ContactControls>());

      act(() => {
        result.current.push(createContactGroup('rolster'));
      });

      act(() => {
        result.current.groups[0].controls.name.setValue('react');
      });

      expect(result.current.value).toEqual([{ name: 'react' }]);
      expect(result.current.groups[0].dirty).toBe(true);
    });
  });

  describe('merge', () => {
    it('should add all the given groups to the array', () => {
      const { result } = renderHook(() =>
        useFormArray<ContactControls>([createContactGroup('rolster')])
      );

      act(() => {
        result.current.merge([
          createContactGroup('react'),
          createContactGroup('angular')
        ]);
      });

      expect(result.current.value).toEqual([
        { name: 'rolster' },
        { name: 'react' },
        { name: 'angular' }
      ]);
    });
  });

  describe('remove', () => {
    it('should remove the group from the array', () => {
      const { result } = renderHook(() =>
        useFormArray<ContactControls>([
          createContactGroup('rolster'),
          createContactGroup('react')
        ])
      );

      act(() => {
        result.current.remove(result.current.groups[0]);
      });

      expect(result.current.value).toEqual([{ name: 'react' }]);
    });
  });

  describe('findByUuid', () => {
    it('should find a group by its uuid', () => {
      const { result } = renderHook(() =>
        useFormArray<ContactControls>([
          createContactGroup('rolster', 'group-rolster')
        ])
      );

      expect(result.current.findByUuid('group-rolster')?.value).toEqual({
        name: 'rolster'
      });
      expect(result.current.findByUuid('group-unknown')).toBeUndefined();
    });
  });

  describe('setValue', () => {
    it('should replace the groups of the array', () => {
      const { result } = renderHook(() =>
        useFormArray<ContactControls>([createContactGroup('rolster')])
      );

      act(() => {
        result.current.setValue([
          createContactGroup('react'),
          createContactGroup('angular')
        ]);
      });

      expect(result.current.value).toEqual([
        { name: 'react' },
        { name: 'angular' }
      ]);
    });
  });

  describe('controls synchronization', () => {
    it('should update the array value when a control of a group changes', () => {
      const { result } = renderHook(() =>
        useFormArray<ContactControls>([createContactGroup('rolster')])
      );

      act(() => {
        result.current.groups[0].controls.name.setValue('react');
      });

      expect(result.current.value).toEqual([{ name: 'react' }]);
      expect(result.current.controls[0].name.value).toBe('react');
    });

    it('should replace the group with a new instance when a control changes', () => {
      const { result } = renderHook(() =>
        useFormArray<ContactControls>([createContactGroup('rolster')])
      );

      const initialGroup = result.current.groups[0];

      act(() => {
        result.current.groups[0].controls.name.touch();
      });

      expect(result.current.groups[0]).not.toBe(initialGroup);
      expect(result.current.groups[0].touched).toBe(true);
    });
  });

  describe('array validators', () => {
    it('should evaluate validators over the groups', () => {
      const { result } = renderHook(() =>
        useFormArray<ContactControls>(
          [createContactGroup('rolster')],
          [minTwoGroups]
        )
      );

      expect(result.current.valid).toBe(false);
      expect(result.current.error?.id).toBe('minGroups');
      expect(result.current.hasError('minGroups')).toBe(true);
      expect(result.current.someErrors(['minGroups', 'unknown'])).toBe(true);
      expect(result.current.someErrors(['unknown'])).toBe(false);

      act(() => {
        result.current.push(createContactGroup('react'));
      });

      expect(result.current.valid).toBe(true);
    });

    it('should revalidate the groups with setValidators', () => {
      const { result } = renderHook(() =>
        useFormArray<ContactControls>([createContactGroup('rolster')])
      );

      expect(result.current.valid).toBe(true);

      act(() => {
        result.current.setValidators([minTwoGroups]);
      });

      expect(result.current.valid).toBe(false);
    });
  });

  describe('disable and enable', () => {
    it('should toggle the disabled state of the array', () => {
      const { result } = renderHook(() => useFormArray<ContactControls>());

      act(() => {
        result.current.disable();
      });

      expect(result.current.disabled).toBe(true);
      expect(result.current.enabled).toBe(false);

      act(() => {
        result.current.enable();
      });

      expect(result.current.enabled).toBe(true);
    });
  });

  describe('reset', () => {
    it('should restore the initial groups of the array', () => {
      const { result } = renderHook(() =>
        useFormArray<ContactControls>([createContactGroup('rolster')])
      );

      act(() => {
        result.current.push(createContactGroup('react'));
      });

      expect(result.current.groups.length).toBe(2);

      act(() => {
        result.current.reset();
      });

      expect(result.current.groups.length).toBe(1);
      expect(result.current.value).toEqual([{ name: 'rolster' }]);
    });
  });
});
