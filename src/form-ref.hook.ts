import { FormControlOptions } from '@rolster/forms';
import { createFormControlOptions } from '@rolster/forms/arguments';
import { ValidatorFn } from '@rolster/validators';
import { useEffect } from 'react';
import { useInputControl } from './form-control.hook';
import { ReactInputControl } from './types';

interface ReactRefOptions<T = any> extends FormControlOptions<T> {
  setValue: (control: ReactInputControl<T>, value: string) => void;
  touched?: boolean;
}

type InputRefOptions<T = any> = Omit<ReactRefOptions<T>, 'setValue'>;
type TextRefOptions = InputRefOptions<string>;
type NumberRefOptions = InputRefOptions<number>;

function useInputRefControl<T = any>(options: ReactRefOptions<T>) {
  const control = useInputControl(options);

  useEffect(() => {
    const { elementRef } = control;

    elementRef?.current?.addEventListener('focus', () => {
      control.focus();
    });

    elementRef?.current?.addEventListener('blur', () => {
      control.blur();
    });

    elementRef?.current?.addEventListener('change', ({ target }) => {
      options.setValue(control, (target as HTMLInputElement).value);
    });
  }, []);

  return control;
}

export function useTextRefControl(): ReactInputControl<string>;
export function useTextRefControl(
  options: TextRefOptions
): ReactInputControl<string>;
export function useTextRefControl(
  state: string,
  validators?: ValidatorFn<string>[]
): ReactInputControl<string>;
export function useTextRefControl(
  options?: TextRefOptions | string,
  validators?: ValidatorFn<string>[]
): ReactInputControl<string> {
  return useInputRefControl({
    ...createFormControlOptions<string, InputRefOptions<string>>(
      options,
      validators
    ),
    setValue: (control, value) => {
      control.setValue(value);
    }
  });
}

export function useNumberRefControl(): ReactInputControl<number>;
export function useNumberRefControl(
  options: NumberRefOptions
): ReactInputControl<number>;
export function useNumberRefControl(
  state: number,
  validators?: ValidatorFn<number>[]
): ReactInputControl<number>;
export function useNumberRefControl(
  options?: NumberRefOptions | number,
  validators?: ValidatorFn<number>[]
): ReactInputControl<number> {
  return useInputRefControl({
    ...createFormControlOptions<number, InputRefOptions<number>>(
      options,
      validators
    ),
    setValue: (control, value) => {
      control.setValue(+value);
    }
  });
}
