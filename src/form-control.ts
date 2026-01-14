import { FormControlOptions } from '@rolster/forms';
import { createFormControlOptions } from '@rolster/forms/arguments';
import {
  controlIsValid,
  hasError as rolsterHasError,
  someErrors as rolsterSomeErrors
} from '@rolster/forms/helpers';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { useCallback, useRef, useState } from 'react';
import { ReactFormControl, ReactHtmlControl, ReactInputControl } from './types';

interface ReactControlOptions<T = any> extends FormControlOptions<T> {
  touched?: boolean;
}

interface ControlState<T = any> {
  dirty: boolean;
  disabled: boolean;
  errors: ValidatorError<any>[];
  focused: boolean;
  value: T;
  touched: boolean;
  validators?: ValidatorFn<T>[];
}

function errorsInControl<T = any>(
  value: T,
  validators?: ValidatorFn<T>[]
): ValidatorError<any>[] {
  return validators ? controlIsValid({ value, validators }) : [];
}

function useControl<E extends HTMLElement, T = any>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactFormControl<E, T> {
  const formControl = createFormControlOptions<T, ReactControlOptions<T>>(
    options,
    validators
  );

  const defaultValue = useRef<T>(formControl.value);

  const [state, setState] = useState<ControlState<T>>(() => {
    return {
      dirty: false,
      disabled: false,
      errors: errorsInControl(formControl.value, formControl.validators),
      focused: false,
      touched: !!formControl.touched,
      value: formControl.value,
      validators: formControl.validators
    };
  });

  const elementRef = useRef<E>(null);

  const focus = useCallback(() => {
    setState((state) => ({ ...state, focused: true }));
  }, []);

  const blur = useCallback(() => {
    setState((state) => ({ ...state, focused: false, touched: true }));
  }, []);

  const disable = useCallback(() => {
    setState((state) => ({ ...state, disabled: true }));
  }, []);

  const enable = useCallback(() => {
    setState((state) => ({ ...state, disabled: false }));
  }, []);

  const touch = useCallback(() => {
    setState((state) => ({ ...state, touched: true }));
  }, []);

  const setDefaultValue = useCallback((value: T) => {
    defaultValue.current = value;

    setState((state) => ({
      ...state,
      errors: errorsInControl(value, state.validators),
      value
    }));
  }, []);

  const setStartValue = useCallback((value: T) => {
    setState((state) => ({
      ...state,
      errors: errorsInControl(value, state.validators),
      value
    }));
  }, []);

  const setValue = useCallback((value: T) => {
    setState((state) => ({
      ...state,
      dirty: true,
      errors: errorsInControl(value, state.validators),
      value
    }));
  }, []);

  const setValidators = useCallback((validators?: ValidatorFn<T>[]) => {
    setState((state) => ({
      ...state,
      errors: errorsInControl(state.value, validators),
      validators
    }));
  }, []);

  const reset = useCallback(() => {
    setState((state) => ({
      ...state,
      dirty: false,
      errors: errorsInControl(defaultValue.current, state.validators),
      value: defaultValue.current,
      touched: false
    }));
  }, []);

  const hasError = useCallback(
    (key: string) => {
      return rolsterHasError(state.errors, key);
    },
    [state.errors]
  );

  const someErrors = useCallback(
    (keys: string[]) => {
      return rolsterSomeErrors(state.errors, keys);
    },
    [state.errors]
  );

  const valid = state.errors.length === 0;

  return {
    ...state,
    blur,
    disable,
    elementRef,
    enable,
    enabled: !state.disabled,
    error: state.errors[0],
    focus,
    hasError,
    invalid: !valid,
    pristine: !state.dirty,
    reset,
    setDefaultValue,
    setStartValue,
    setValidators,
    setValue,
    someErrors,
    touch,
    unfocused: !state.focused,
    untouched: !state.touched,
    valid,
    wrong: state.touched && !valid
  };
}

type ReactValueOptions<T> = Omit<ReactControlOptions<T>, 'validators'>;
type ReactValidatorsOptions<T> = Omit<ReactControlOptions<T>, 'value'>;

export function useReactControl<E extends HTMLElement, T>(): ReactFormControl<
  E,
  T | undefined
>;
export function useReactControl<E extends HTMLElement, T>(
  options: ReactValueOptions<T>
): ReactFormControl<E, T>;
export function useReactControl<E extends HTMLElement, T>(
  options: ReactValidatorsOptions<T>
): ReactFormControl<E, T | undefined>;
export function useReactControl<E extends HTMLElement, T>(
  options: ReactControlOptions<T>
): ReactFormControl<E, T>;
export function useReactControl<E extends HTMLElement, T>(
  value: undefined,
  validators?: ValidatorFn<T>[]
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
  options: ReactValueOptions<T>
): ReactHtmlControl<T>;
export function useFormControl<T>(
  options: ReactValidatorsOptions<T>
): ReactHtmlControl<T | undefined>;
export function useFormControl<T>(
  options: ReactControlOptions<T>
): ReactHtmlControl<T>;
export function useFormControl<T>(
  value: undefined,
  validators?: ValidatorFn<T>[]
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
  options: ReactValueOptions<T>
): ReactInputControl<T>;
export function useInputControl<T>(
  options: ReactValidatorsOptions<T>
): ReactInputControl<T | undefined>;
export function useInputControl<T>(
  options: ReactControlOptions<T>
): ReactInputControl<T>;
export function useInputControl<T>(
  value: undefined,
  validators?: ValidatorFn<T>[]
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
