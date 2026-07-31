import { ValidatorGroupFn } from '@rolster/forms';
import { ValidatorFn } from '@rolster/validators';
import { act } from 'react';
import { useFormControl } from '../form-control/form-control';
import { ReactHtmlControl } from '../form-control/form-control.type';
import { renderHook } from '../testing';
import { useFormGroup } from './form-group';

const required: ValidatorFn<string> = (value) =>
  value ? undefined : { id: 'required', message: 'Value is required' };

interface CredentialsControls {
  confirmation: ReactHtmlControl<string>;
  password: ReactHtmlControl<string>;
  [key: string]: ReactHtmlControl<string>;
}

const credentialsMatch: ValidatorGroupFn<CredentialsControls> = ({
  confirmation,
  password
}) =>
  password.value === confirmation.value
    ? undefined
    : { id: 'credentialsMatch', message: 'Credentials do not match' };

function renderCredentialsGroup(validators?: ValidatorGroupFn<CredentialsControls>[]) {
  return renderHook(() => {
    const password = useFormControl<string>('');
    const confirmation = useFormControl<string>('');

    const formGroup = useFormGroup<CredentialsControls>(
      { confirmation, password },
      validators
    );

    return { confirmation, formGroup, password };
  });
}

describe('useFormGroup', () => {
  describe('initial state', () => {
    it('should aggregate the value of all its controls', () => {
      const { result } = renderHook(() => {
        const name = useFormControl('rolster');
        const version = useFormControl(19);

        return useFormGroup({ name, version });
      });

      expect(result.current.value).toEqual({ name: 'rolster', version: 19 });
      expect(result.current.dirty).toBe(false);
      expect(result.current.touched).toBe(false);
      expect(result.current.valid).toBe(true);
      expect(result.current.wrong).toBe(false);
    });

    it('should be invalid when some control is invalid', () => {
      const { result } = renderHook(() => {
        const name = useFormControl('', [required]);
        const email = useFormControl('rolster@mail.com');

        return useFormGroup({ email, name });
      });

      expect(result.current.valid).toBe(false);
      expect(result.current.invalid).toBe(true);
    });

    it('should expose its controls', () => {
      const { result } = renderHook(() => {
        const name = useFormControl('rolster');

        return useFormGroup({ name });
      });

      expect(result.current.controls.name.value).toBe('rolster');
    });
  });

  describe('controls synchronization', () => {
    it('should update the group value when a control value changes', () => {
      const { result } = renderCredentialsGroup();

      act(() => {
        result.current.password.setValue('rolster');
      });

      expect(result.current.formGroup.value).toEqual({
        confirmation: '',
        password: 'rolster'
      });
    });

    it('should recalculate validity when a control value changes', () => {
      const { result } = renderHook(() => {
        const name = useFormControl<string>('', [required]);
        const formGroup = useFormGroup({ name });

        return { formGroup, name };
      });

      expect(result.current.formGroup.valid).toBe(false);

      act(() => {
        result.current.name.setValue('rolster');
      });

      expect(result.current.formGroup.valid).toBe(true);
    });

    it('should be dirty when some control is dirty and dirties when all are', () => {
      const { result } = renderCredentialsGroup();

      act(() => {
        result.current.password.setValue('rolster');
      });

      expect(result.current.formGroup.dirty).toBe(true);
      expect(result.current.formGroup.dirties).toBe(false);
      expect(result.current.formGroup.pristine).toBe(false);

      act(() => {
        result.current.confirmation.setValue('rolster');
      });

      expect(result.current.formGroup.dirties).toBe(true);
      expect(result.current.formGroup.pristines).toBe(false);
    });

    it('should be touched when some control is touched and toucheds when all are', () => {
      const { result } = renderCredentialsGroup();

      act(() => {
        result.current.password.touch();
      });

      expect(result.current.formGroup.touched).toBe(true);
      expect(result.current.formGroup.toucheds).toBe(false);

      act(() => {
        result.current.confirmation.touch();
      });

      expect(result.current.formGroup.toucheds).toBe(true);
      expect(result.current.formGroup.untoucheds).toBe(false);
    });
  });

  describe('group validators', () => {
    it('should evaluate validators over all the controls', () => {
      const { result } = renderCredentialsGroup([credentialsMatch]);

      expect(result.current.formGroup.valid).toBe(true);

      act(() => {
        result.current.password.setValue('rolster');
      });

      expect(result.current.formGroup.valid).toBe(false);
      expect(result.current.formGroup.error?.id).toBe('credentialsMatch');

      act(() => {
        result.current.confirmation.setValue('rolster');
      });

      expect(result.current.formGroup.valid).toBe(true);
    });

    it('should be wrong only when the group is touched and invalid', () => {
      const { result } = renderCredentialsGroup([credentialsMatch]);

      act(() => {
        result.current.password.setValue('rolster');
      });

      expect(result.current.formGroup.wrong).toBe(false);

      act(() => {
        result.current.password.touch();
      });

      expect(result.current.formGroup.wrong).toBe(true);
    });

    it('should revalidate the controls with setValidators', () => {
      const { result } = renderCredentialsGroup();

      act(() => {
        result.current.password.setValue('rolster');
      });

      expect(result.current.formGroup.valid).toBe(true);

      act(() => {
        result.current.formGroup.setValidators([credentialsMatch]);
      });

      expect(result.current.formGroup.valid).toBe(false);
    });
  });

  describe('setValue', () => {
    it('should set the value of the controls declared in the partial value', () => {
      const { result } = renderCredentialsGroup();

      act(() => {
        result.current.formGroup.setValue({ password: 'rolster' });
      });

      expect(result.current.password.value).toBe('rolster');
      expect(result.current.confirmation.value).toBe('');
      expect(result.current.formGroup.value).toEqual({
        confirmation: '',
        password: 'rolster'
      });
    });
  });

  describe('reset', () => {
    it('should reset all the controls of the group', () => {
      const { result } = renderCredentialsGroup();

      act(() => {
        result.current.password.setValue('rolster');
        result.current.confirmation.setValue('react');
        result.current.password.touch();
      });

      act(() => {
        result.current.formGroup.reset();
      });

      expect(result.current.formGroup.value).toEqual({
        confirmation: '',
        password: ''
      });
      expect(result.current.formGroup.dirty).toBe(false);
      expect(result.current.formGroup.touched).toBe(false);
    });
  });
});
