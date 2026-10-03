import { ValidatorFn } from '@rolster/validators';
import {
  areaArrayControl,
  formArrayControl,
  inputArrayControl,
  reactArrayControl
} from './form-array-control';
import { ReactArrayAction, ReactArrayControl } from './form-array-control.type';

const required: ValidatorFn<string> = (value) =>
  value ? undefined : { id: 'required', message: 'Value is required' };

interface ControlTrack<T> {
  actions: ReactArrayAction[];
  current: ReactArrayControl<HTMLElement, T>;
}

function trackControl<T>(
  control: ReactArrayControl<HTMLElement, T>
): ControlTrack<T> {
  const track: ControlTrack<T> = { actions: [], current: control };

  const listen = (control: ReactArrayControl<HTMLElement, T>) => {
    control.subscribe((action, nextControl) => {
      track.actions.push(action);
      track.current = nextControl;

      listen(nextControl);
    });
  };

  listen(control);

  return track;
}

describe('formArrayControl', () => {
  describe('initial state', () => {
    it('should create a pristine control', () => {
      const control = formArrayControl('rolster');

      expect(control.uuid).toBeDefined();
      expect(control.value).toBe('rolster');
      expect(control.dirty).toBe(false);
      expect(control.pristine).toBe(true);
      expect(control.touched).toBe(false);
      expect(control.untouched).toBe(true);
      expect(control.focused).toBe(false);
      expect(control.unfocused).toBe(true);
      expect(control.disabled).toBe(false);
      expect(control.enabled).toBe(true);
      expect(control.valid).toBe(true);
      expect(control.wrong).toBe(false);
    });

    it('should evaluate validators against the initial value', () => {
      const control = formArrayControl('', [required]);

      expect(control.valid).toBe(false);
      expect(control.invalid).toBe(true);
      expect(control.error?.id).toBe('required');
    });

    it('should create controls with unique uuid', () => {
      expect(formArrayControl('a').uuid).not.toBe(formArrayControl('a').uuid);
    });
  });

  describe('setValue', () => {
    it('should notify a new dirty control with the value revalidated', () => {
      const control = formArrayControl<string>('', [required]);
      const track = trackControl(control);

      track.current.setValue('rolster');

      expect(track.actions).toEqual(['value']);
      expect(track.current.value).toBe('rolster');
      expect(track.current.dirty).toBe(true);
      expect(track.current.valid).toBe(true);
    });

    it('should not notify when the value does not change', () => {
      const control = formArrayControl('rolster');
      const track = trackControl(control);

      track.current.setValue('rolster');

      expect(track.actions).toEqual([]);
      expect(track.current).toBe(control);
    });

    it('should not mutate the original control', () => {
      const control = formArrayControl('rolster');
      const track = trackControl(control);

      track.current.setValue('react');

      expect(control.value).toBe('rolster');
      expect(control.dirty).toBe(false);
      expect(track.current).not.toBe(control);
    });
  });

  describe('setStartValue', () => {
    it('should update the value without marking the control as dirty', () => {
      const track = trackControl(formArrayControl(''));

      track.current.setStartValue('rolster');

      expect(track.current.value).toBe('rolster');
      expect(track.current.dirty).toBe(false);
    });
  });

  describe('setDefaultValue', () => {
    it('should update the value and the default value used by reset', () => {
      const track = trackControl(formArrayControl<string>('rolster'));

      track.current.setDefaultValue('react');

      expect(track.current.value).toBe('react');

      track.current.setValue('angular');
      track.current.reset();

      expect(track.current.value).toBe('react');
    });
  });

  describe('interaction state', () => {
    it('should notify focused on focus and touched on blur', () => {
      const track = trackControl(formArrayControl(''));

      track.current.focus();

      expect(track.current.focused).toBe(true);

      track.current.blur();

      expect(track.current.focused).toBe(false);
      expect(track.current.touched).toBe(true);
      expect(track.actions).toEqual(['focused', 'focused']);
    });

    it('should not notify focus and blur when the state does not change', () => {
      const track = trackControl(formArrayControl(''));

      track.current.blur();

      expect(track.actions).toEqual([]);

      track.current.focus();
      track.current.focus();

      expect(track.actions).toEqual(['focused']);
    });

    it('should notify touched only when the control is untouched', () => {
      const track = trackControl(formArrayControl(''));

      track.current.touch();
      track.current.touch();

      expect(track.actions).toEqual(['touched']);
      expect(track.current.touched).toBe(true);
    });

    it('should toggle the disabled state with disable and enable', () => {
      const track = trackControl(formArrayControl(''));

      track.current.disable();

      expect(track.current.disabled).toBe(true);
      expect(track.current.enabled).toBe(false);

      track.current.enable();

      expect(track.current.disabled).toBe(false);
      expect(track.actions).toEqual(['disabled', 'disabled']);
    });
  });

  describe('setValidators', () => {
    it('should revalidate the current value', () => {
      const track = trackControl(formArrayControl(''));

      expect(track.current.valid).toBe(true);

      track.current.setValidators([required]);

      expect(track.actions).toEqual(['validators']);
      expect(track.current.valid).toBe(false);
    });
  });

  describe('reset', () => {
    it('should restore the default value and clear dirty and touched', () => {
      const track = trackControl(formArrayControl('rolster'));

      track.current.setValue('react');
      track.current.touch();
      track.current.reset();

      expect(track.current.value).toBe('rolster');
      expect(track.current.dirty).toBe(false);
      expect(track.current.touched).toBe(false);
    });
  });

  describe('errors verification', () => {
    it('should verify errors with hasError and someErrors', () => {
      const control = formArrayControl('', [required]);

      expect(control.hasError('required')).toBe(true);
      expect(control.hasError('email')).toBe(false);
      expect(control.someErrors(['email', 'required'])).toBe(true);
      expect(control.someErrors(['email', 'pattern'])).toBe(false);
    });
  });
});

describe('reactArrayControl', () => {
  it('should create a control with generic element type', () => {
    const control = reactArrayControl<HTMLInputElement, string>('rolster');

    expect(control.value).toBe('rolster');
    expect(control.valid).toBe(true);
  });
});

describe('inputArrayControl', () => {
  it('should create a control for input elements', () => {
    const control = inputArrayControl('rolster');

    expect(control.value).toBe('rolster');
  });
});

describe('areaArrayControl', () => {
  it('should create a control for textarea elements', () => {
    const control = areaArrayControl('rolster', [required]);

    expect(control.value).toBe('rolster');
    expect(control.valid).toBe(true);
  });
});

describe('formArrayControl formatter', () => {
  const upperCase = (value: string) => value.toUpperCase();
  const onlyDigits = (value: string) => value.replace(/\D/g, '');

  it('should format the initial value and expose the formatter', () => {
    const control = formArrayControl({ formatter: upperCase, value: 'abc' });

    expect(control.value).toBe('ABC');
    expect(control.formatter).toBe(upperCase);
  });

  it("should format on setValue and emit a 'value' action", () => {
    const track = trackControl(
      formArrayControl({ formatter: upperCase, value: '' })
    );

    track.current.setValue('abc');

    expect(track.actions).toEqual(['value']);
    expect(track.current.value).toBe('ABC');
    expect(track.current.dirty).toBe(true);
    expect(track.current.formatter).toBe(upperCase);
  });

  it('should not emit when the formatter rejects the input', () => {
    const track = trackControl(
      formArrayControl({ formatter: onlyDigits, value: '12' })
    );

    track.current.setValue('12a');

    expect(track.actions).toEqual([]);
    expect(track.current.value).toBe('12');
  });

  it("should format on blur with a 'value' action when formatOn is 'blur'", () => {
    const track = trackControl(
      formArrayControl({
        formatOn: 'blur',
        formatter: upperCase,
        validators: [required],
        value: ''
      })
    );

    track.current.focus();
    track.current.setValue('abc');

    expect(track.current.value).toBe('abc');

    track.current.blur();

    expect(track.actions).toEqual(['focused', 'value', 'value']);
    expect(track.current.value).toBe('ABC');
    expect(track.current.touched).toBe(true);
    expect(track.current.focused).toBe(false);
    expect(track.current.valid).toBe(true);
  });

  it("should emit a 'focused' action on blur when the value does not change", () => {
    const track = trackControl(
      formArrayControl({ formatOn: 'blur', formatter: upperCase, value: 'ABC' })
    );

    track.current.focus();
    track.current.blur();

    expect(track.actions).toEqual(['focused', 'focused']);
    expect(track.current.touched).toBe(true);
  });
});
