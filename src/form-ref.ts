import { FormControlOptions } from '@rolster/forms';
import { createFormControlOptions } from '@rolster/forms/helpers';
import { ValidatorFn } from '@rolster/validators';
import { useEffect } from 'react';
import { useInputControl } from './form-control';
import { ReactInputControl } from './types';

interface ReactRefOptions<T = any> extends FormControlOptions<T> {
  setValue: (control: ReactInputControl<T>, value: string) => void;
  touched?: boolean;
}

type InputRefOptions<T = any> = Omit<ReactRefOptions<T>, 'setValue'>;
type TextRefOptions = InputRefOptions<string>;
type NumberRefOptions = InputRefOptions<number>;

function useInputRefControl<T = any>(options: ReactRefOptions<T>) {
  const formRef = useInputControl(options);

  useEffect(() => {
    formRef.elementRef?.current?.addEventListener('focus', () => {
      formRef.focus();
    });

    formRef.elementRef?.current?.addEventListener('blur', () => {
      formRef.blur();
    });

    formRef.elementRef?.current?.addEventListener('change', ({ target }) => {
      options.setValue(formRef, (target as HTMLInputElement).value);
    });
  }, []);

  return formRef;
}

export function useTextRefControl(): ReactInputControl<string>;
export function useTextRefControl(
  options: TextRefOptions
): ReactInputControl<string>;
export function useTextRefControl(
  value: string,
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
  value: number,
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
