import {
  FormControlProps,
  FormState,
  createFormControlProps
} from '@rolster/helpers-forms';
import { ValidatorFn } from '@rolster/validators';
import { useEffect } from 'react';
import { useInputControl } from './form-control.hook';
import { ReactInputControl } from './types';

interface ReactRefProps<T = any> extends FormControlProps<T> {
  setValue: (inputControl: ReactInputControl<T>, value: string) => void;
  touched?: boolean;
}

type InputRefProps<T = any> = Omit<ReactRefProps<T>, 'setValue'>;

type TextRefProps = InputRefProps<string>;
type NumberRefProps = InputRefProps<number>;

function useInputRefControl<T = any>(props: ReactRefProps<T>) {
  const { setValue, state, validators } = props;

  const inputControl = useInputControl(state, validators);

  useEffect(() => {
    const { elementRef } = inputControl;

    elementRef?.current?.addEventListener('focus', () => {
      inputControl.focus();
    });

    elementRef?.current?.addEventListener('blur', () => {
      inputControl.blur();

      if (!inputControl.touched) {
        inputControl.touch();
      }
    });

    elementRef?.current?.addEventListener('change', ({ target }) => {
      setValue(inputControl, (target as HTMLInputElement).value);
    });
  }, []);

  return inputControl;
}

export function useTextRefControl(): ReactInputControl<string>;
export function useTextRefControl(
  props: TextRefProps
): ReactInputControl<string>;
export function useTextRefControl(
  state: FormState<string>,
  validators?: ValidatorFn<string>[]
): ReactInputControl<string>;
export function useTextRefControl(
  controlProps?: TextRefProps | FormState<string>,
  controlValidators?: ValidatorFn<string>[]
): ReactInputControl<string> {
  return useInputRefControl({
    ...createFormControlProps<string, InputRefProps<string>>(
      controlProps,
      controlValidators
    ),
    setValue: (inputControl, value) => inputControl.setState(value)
  });
}

export function useNumberRefControl(): ReactInputControl<number>;
export function useNumberRefControl(
  props: NumberRefProps
): ReactInputControl<number>;
export function useNumberRefControl(
  state: FormState<number>,
  validators?: ValidatorFn<number>[]
): ReactInputControl<number>;
export function useNumberRefControl(
  controlProps?: NumberRefProps | FormState<number>,
  controlValidators?: ValidatorFn<number>[]
): ReactInputControl<number> {
  return useInputRefControl({
    ...createFormControlProps<number, InputRefProps<number>>(
      controlProps,
      controlValidators
    ),
    setValue: (inputControl, value) => inputControl.setState(+value)
  });
}
