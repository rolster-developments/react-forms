import { ValidatorFn } from '@rolster/validators';
import { act } from 'react';
import { renderHook } from '../testing';
import {
  useAreaControl,
  useFormControl,
  useInputControl,
  useReactControl
} from './form-control';

const required: ValidatorFn<string> = (value) =>
  value ? undefined : { id: 'required', message: 'Value is required' };

const minLength3: ValidatorFn<string> = (value) =>
  value && value.length >= 3
    ? undefined
    : { id: 'minLength', message: 'Value requires at least 3 characters' };

describe('useFormControl', () => {
  describe('initial state', () => {
    it('should create a pristine control without arguments', () => {
      const { result } = renderHook(() => useFormControl<string>());

      expect(result.current.value).toBeUndefined();
      expect(result.current.dirty).toBe(false);
      expect(result.current.pristine).toBe(true);
      expect(result.current.touched).toBe(false);
      expect(result.current.untouched).toBe(true);
      expect(result.current.focused).toBe(false);
      expect(result.current.unfocused).toBe(true);
      expect(result.current.disabled).toBe(false);
      expect(result.current.enabled).toBe(true);
      expect(result.current.valid).toBe(true);
      expect(result.current.invalid).toBe(false);
      expect(result.current.wrong).toBe(false);
      expect(result.current.errors).toEqual([]);
      expect(result.current.error).toBeUndefined();
    });

    it('should create a control with initial value', () => {
      const { result } = renderHook(() => useFormControl('rolster'));

      expect(result.current.value).toBe('rolster');
    });

    it('should evaluate validators against the initial value', () => {
      const { result } = renderHook(() => useFormControl('', [required]));

      expect(result.current.valid).toBe(false);
      expect(result.current.invalid).toBe(true);
      expect(result.current.error?.id).toBe('required');
    });

    it('should create a control from an options object', () => {
      const { result } = renderHook(() =>
        useFormControl({ touched: true, validators: [required], value: 'ok' })
      );

      expect(result.current.value).toBe('ok');
      expect(result.current.touched).toBe(true);
      expect(result.current.valid).toBe(true);
    });
  });

  describe('setValue', () => {
    it('should update the value and mark the control as dirty', () => {
      const { result } = renderHook(() => useFormControl<string>(''));

      act(() => {
        result.current.setValue('react');
      });

      expect(result.current.value).toBe('react');
      expect(result.current.dirty).toBe(true);
      expect(result.current.pristine).toBe(false);
    });

    it('should revalidate the value on each change', () => {
      const { result } = renderHook(() =>
        useFormControl<string>('', [required])
      );

      act(() => {
        result.current.setValue('react');
      });

      expect(result.current.valid).toBe(true);

      act(() => {
        result.current.setValue('');
      });

      expect(result.current.valid).toBe(false);
      expect(result.current.error?.id).toBe('required');
    });
  });

  describe('functional setValue', () => {
    it('should update the value from the current value with an updater', () => {
      const { result } = renderHook(() => useFormControl(10));

      act(() => {
        result.current.setValue((current) => current + 5);
      });

      expect(result.current.value).toBe(15);
      expect(result.current.dirty).toBe(true);
    });

    it('should apply all the updaters called in the same tick', () => {
      const { result } = renderHook(() => useFormControl(10));

      act(() => {
        result.current.setValue((current) => current + 1);
        result.current.setValue((current) => current + 1);
      });

      expect(result.current.value).toBe(12);
    });

    it('should not change the state when the value does not change', () => {
      const { result } = renderHook(() => useFormControl('rolster'));

      act(() => {
        result.current.setValue('rolster');
      });

      expect(result.current.dirty).toBe(false);

      act(() => {
        result.current.setValue((current) => current);
      });

      expect(result.current.dirty).toBe(false);
    });
  });

  describe('setStartValue', () => {
    it('should update the value without marking the control as dirty', () => {
      const { result } = renderHook(() =>
        useFormControl<string>('', [required])
      );

      act(() => {
        result.current.setStartValue('react');
      });

      expect(result.current.value).toBe('react');
      expect(result.current.dirty).toBe(false);
      expect(result.current.valid).toBe(true);
    });
  });

  describe('reset', () => {
    it('should restore the initial value and clear dirty and touched', () => {
      const { result } = renderHook(() => useFormControl('rolster'));

      act(() => {
        result.current.setValue('react');
        result.current.touch();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.value).toBe('rolster');
      expect(result.current.dirty).toBe(false);
      expect(result.current.touched).toBe(false);
    });

    it('should restore the value defined with setDefaultValue', () => {
      const { result } = renderHook(() => useFormControl('rolster'));

      act(() => {
        result.current.setDefaultValue('react');
      });

      act(() => {
        result.current.setValue('angular');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.value).toBe('react');
    });
  });

  describe('interaction state', () => {
    it('should mark the control as focused on focus', () => {
      const { result } = renderHook(() => useFormControl(''));

      act(() => {
        result.current.focus();
      });

      expect(result.current.focused).toBe(true);
      expect(result.current.unfocused).toBe(false);
    });

    it('should mark the control as touched and unfocused on blur', () => {
      const { result } = renderHook(() => useFormControl(''));

      act(() => {
        result.current.focus();
      });

      act(() => {
        result.current.blur();
      });

      expect(result.current.focused).toBe(false);
      expect(result.current.touched).toBe(true);
    });

    it('should mark the control as touched on touch', () => {
      const { result } = renderHook(() => useFormControl(''));

      act(() => {
        result.current.touch();
      });

      expect(result.current.touched).toBe(true);
      expect(result.current.untouched).toBe(false);
    });

    it('should toggle the disabled state with disable and enable', () => {
      const { result } = renderHook(() => useFormControl(''));

      act(() => {
        result.current.disable();
      });

      expect(result.current.disabled).toBe(true);
      expect(result.current.enabled).toBe(false);

      act(() => {
        result.current.enable();
      });

      expect(result.current.disabled).toBe(false);
      expect(result.current.enabled).toBe(true);
    });
  });

  describe('validation state', () => {
    it('should be wrong only when the control is touched and invalid', () => {
      const { result } = renderHook(() =>
        useFormControl<string>('', [required])
      );

      expect(result.current.wrong).toBe(false);

      act(() => {
        result.current.touch();
      });

      expect(result.current.wrong).toBe(true);

      act(() => {
        result.current.setValue('react');
      });

      expect(result.current.wrong).toBe(false);
    });

    it('should collect the errors of all failing validators', () => {
      const { result } = renderHook(() =>
        useFormControl('', [required, minLength3])
      );

      expect(result.current.errors.length).toBe(2);
      expect(result.current.error?.id).toBe('required');
    });

    it('should revalidate the current value with setValidators', () => {
      const { result } = renderHook(() => useFormControl(''));

      expect(result.current.valid).toBe(true);

      act(() => {
        result.current.setValidators([required]);
      });

      expect(result.current.valid).toBe(false);

      act(() => {
        result.current.setValidators(undefined);
      });

      expect(result.current.valid).toBe(true);
    });

    it('should verify errors with hasError and someErrors', () => {
      const { result } = renderHook(() =>
        useFormControl('', [required, minLength3])
      );

      expect(result.current.hasError('required')).toBe(true);
      expect(result.current.hasError('email')).toBe(false);
      expect(result.current.someErrors(['email', 'minLength'])).toBe(true);
      expect(result.current.someErrors(['email', 'pattern'])).toBe(false);
    });
  });

  describe('memoization', () => {
    it('should keep stable references of the control methods across renders', () => {
      const { result } = renderHook(() => useFormControl<string>(''));

      const { blur, focus, reset, setValidators, setValue, touch } =
        result.current;

      act(() => {
        result.current.setValue('react');
      });

      expect(result.current.blur).toBe(blur);
      expect(result.current.focus).toBe(focus);
      expect(result.current.reset).toBe(reset);
      expect(result.current.setValidators).toBe(setValidators);
      expect(result.current.setValue).toBe(setValue);
      expect(result.current.touch).toBe(touch);
    });

    it('should keep the same control reference when the component re-renders without changes', () => {
      const { rerender, result } = renderHook(() => useFormControl('rolster'));

      const control = result.current;

      rerender();

      expect(result.current).toBe(control);
    });

    it('should return a new control reference when the state changes', () => {
      const { result } = renderHook(() => useFormControl<string>(''));

      const control = result.current;

      act(() => {
        result.current.setValue('rolster');
      });

      expect(result.current).not.toBe(control);
      expect(result.current.value).toBe('rolster');
    });
  });
});

const upperCase = (value: string) => value.toUpperCase();
const onlyDigits = (value: string) => value.replace(/\D/g, '');

describe('useFormControl formatter', () => {
  describe("formatOn 'input' (default)", () => {
    it('should expose the formatter options', () => {
      const { result } = renderHook(() =>
        useFormControl({ formatter: upperCase, value: 'abc' })
      );

      expect(result.current.formatter).toBe(upperCase);
      expect(result.current.formatOn).toBeUndefined();
    });

    it('should format the initial value', () => {
      const { result } = renderHook(() =>
        useFormControl({ formatter: upperCase, value: 'abc' })
      );

      expect(result.current.value).toBe('ABC');
    });

    it('should format the value on setValue and mark the control as dirty', () => {
      const { result } = renderHook(() =>
        useFormControl({ formatter: upperCase, value: '' })
      );

      act(() => {
        result.current.setValue('abc');
      });

      expect(result.current.value).toBe('ABC');
      expect(result.current.dirty).toBe(true);
    });

    it('should format the value produced by an updater', () => {
      const { result } = renderHook(() =>
        useFormControl({ formatter: upperCase, value: 'a' })
      );

      act(() => {
        result.current.setValue((current) => `${current}b`);
      });

      expect(result.current.value).toBe('AB');
    });

    it('should not change the state when the formatter rejects the input', () => {
      const { result } = renderHook(() =>
        useFormControl({ formatter: onlyDigits, value: '12' })
      );

      const control = result.current;

      act(() => {
        result.current.setValue('12a');
      });

      expect(result.current).toBe(control);
      expect(result.current.value).toBe('12');
      expect(result.current.dirty).toBe(false);
    });

    it('should run validators against the formatted value', () => {
      const { result } = renderHook(() =>
        useFormControl({
          formatter: onlyDigits,
          validators: [required],
          value: '1'
        })
      );

      expect(result.current.valid).toBe(true);

      act(() => {
        result.current.setValue('abc');
      });

      expect(result.current.value).toBe('');
      expect(result.current.valid).toBe(false);
    });

    it('should format setStartValue, setDefaultValue and reset', () => {
      const { result } = renderHook(() =>
        useFormControl({ formatter: upperCase, value: '' })
      );

      act(() => {
        result.current.setStartValue('start');
      });

      expect(result.current.value).toBe('START');
      expect(result.current.dirty).toBe(false);

      act(() => {
        result.current.setDefaultValue('default');
      });

      act(() => {
        result.current.setValue('other');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.value).toBe('DEFAULT');
    });

    it('should not format on blur', () => {
      const { result } = renderHook(() =>
        useFormControl({ formatter: upperCase, value: 'ABC' })
      );

      const control = result.current;

      act(() => {
        result.current.blur();
      });

      expect(result.current.value).toBe('ABC');
      expect(result.current.touched).toBe(true);
      expect(result.current).not.toBe(control);
    });
  });

  describe("formatOn 'blur'", () => {
    it('should keep the raw value while typing and format on blur', () => {
      const { result } = renderHook(() =>
        useFormControl({
          formatOn: 'blur',
          formatter: upperCase,
          validators: [required],
          value: ''
        })
      );

      act(() => {
        result.current.setValue('abc');
      });

      expect(result.current.value).toBe('abc');

      act(() => {
        result.current.blur();
      });

      expect(result.current.value).toBe('ABC');
      expect(result.current.touched).toBe(true);
      expect(result.current.focused).toBe(false);
      expect(result.current.valid).toBe(true);
    });

    it('should revalidate the formatted value on blur', () => {
      const { result } = renderHook(() =>
        useFormControl({
          formatOn: 'blur',
          formatter: onlyDigits,
          validators: [required],
          value: ''
        })
      );

      act(() => {
        result.current.setValue('abc');
      });

      expect(result.current.valid).toBe(true);

      act(() => {
        result.current.blur();
      });

      expect(result.current.value).toBe('');
      expect(result.current.valid).toBe(false);
      expect(result.current.wrong).toBe(true);
    });

    it('should not format the initial or start value', () => {
      const { result } = renderHook(() =>
        useFormControl({ formatOn: 'blur', formatter: upperCase, value: 'abc' })
      );

      expect(result.current.value).toBe('abc');

      act(() => {
        result.current.setStartValue('start');
      });

      expect(result.current.value).toBe('start');
    });
  });
});

describe('useReactControl', () => {
  it('should create a control with an element reference', () => {
    const { result } = renderHook(() =>
      useReactControl<HTMLInputElement, string>('rolster')
    );

    expect(result.current.value).toBe('rolster');
    expect(result.current.elementRef?.current).toBeNull();
  });
});

describe('useInputControl', () => {
  it('should create a control for input elements', () => {
    const { result } = renderHook(() => useInputControl('rolster'));

    expect(result.current.value).toBe('rolster');
    expect(result.current.valid).toBe(true);
  });
});

describe('useAreaControl', () => {
  it('should create a control for textarea elements', () => {
    const { result } = renderHook(() => useAreaControl('rolster', [required]));

    expect(result.current.value).toBe('rolster');
    expect(result.current.valid).toBe(true);
  });
});
