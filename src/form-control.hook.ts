import { FormControlOptions } from '@rolster/forms';
import { createFormControlOptions } from '@rolster/forms/arguments';
import { controlIsValid } from '@rolster/forms/helpers';
import { ValidatorFn } from '@rolster/validators';
import { useRef, useState } from 'react';
import { ReactFormControl, ReactHtmlControl, ReactInputControl } from './types';

interface ReactControlOptions<T = any> extends FormControlOptions<T> {
  touched?: boolean;
}

interface ControlState<T = any> {
  dirty: boolean;
  disabled: boolean;
  focused: boolean;
  value: T;
  touched: boolean;
  validators?: ValidatorFn<T>[];
}

function useControl<E extends HTMLElement, T = any>(
  controlOptions?: ReactControlOptions<T> | T,
  controlValidators?: ValidatorFn<T>[]
): ReactFormControl<E, T> {
  const { value, touched, validators } = createFormControlOptions<
    T,
    ReactControlOptions<T>
  >(controlOptions, controlValidators);

  const [state, setState] = useState<ControlState<T>>({
    dirty: false,
    disabled: false,
    focused: false,
    touched: !!touched,
    validators,
    value
  });

  const initialValue = useRef<T>(value);
  const elementRef = useRef<E>(null);

  const errors = state.validators
    ? controlIsValid({
        value: state.value,
        validators: state.validators
      })
    : [];
  const valid = errors.length === 0;

  function focus(): void {
    setState((state) => ({ ...state, focused: true }));
  }

  function blur(): void {
    setState((state) => ({ ...state, focused: false, touched: true }));
  }

  function disable(): void {
    setState((state) => ({ ...state, disabled: true }));
  }

  function enable(): void {
    setState((state) => ({ ...state, disabled: false }));
  }

  function touch(): void {
    setState((state) => ({ ...state, touched: true }));
  }

  function setValue(value: T): void {
    setState((state) => ({ ...state, dirty: true, value }));
  }

  function setValidators(validators?: ValidatorFn<T>[]): void {
    setState((state) => ({ ...state, validators }));
  }

  function reset(): void {
    setState((state) => ({
      ...state,
      dirty: false,
      value: initialValue.current,
      touched: false
    }));
  }

  return {
    ...state,
    blur,
    disable,
    elementRef,
    enable,
    enabled: !state.disabled,
    error: errors[0],
    errors,
    focus,
    invalid: !valid,
    pristine: !state.dirty,
    reset,
    setValidators,
    setValue,
    touch,
    unfocused: !state.focused,
    untouched: !state.touched,
    valid,
    wrong: state.touched && !valid
  };
}

type ReactStateOptions<T> = Omit<ReactControlOptions<T>, 'validators'>;
type ReactValidatorsOptions<T> = Omit<ReactControlOptions<T>, 'value'>;

export function useReactControl<E extends HTMLElement, T>(): ReactFormControl<
  E,
  T | undefined
>;
export function useReactControl<E extends HTMLElement, T>(
  options: ReactStateOptions<T>
): ReactFormControl<E, T>;
export function useReactControl<E extends HTMLElement, T>(
  options: ReactValidatorsOptions<T>
): ReactFormControl<E, T | undefined>;
export function useReactControl<E extends HTMLElement, T>(
  value: T,
  validators?: ValidatorFn<T>[]
): ReactFormControl<E, T>;
export function useReactControl<E extends HTMLElement, T>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactFormControl<E, T> {
  return useControl(options, validators);
}

export function useFormControl<T>(): ReactHtmlControl<T | undefined>;
export function useFormControl<T>(
  options: ReactStateOptions<T>
): ReactHtmlControl<T>;
export function useFormControl<T>(
  options: ReactValidatorsOptions<T>
): ReactHtmlControl<T | undefined>;
export function useFormControl<T>(
  value: T,
  validators?: ValidatorFn<T>[]
): ReactHtmlControl<T>;
export function useFormControl<T>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactHtmlControl<T> {
  return useControl<HTMLElement>(options, validators);
}

export function useInputControl<T>(): ReactInputControl<T | undefined>;
export function useInputControl<T>(
  options: ReactStateOptions<T>
): ReactInputControl<T>;
export function useInputControl<T>(
  options: ReactValidatorsOptions<T>
): ReactInputControl<T | undefined>;
export function useInputControl<T>(
  value: T,
  validators?: ValidatorFn<T>[]
): ReactInputControl<T>;
export function useInputControl<T>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactInputControl<T> {
  return useControl<HTMLInputElement>(options, validators);
}
