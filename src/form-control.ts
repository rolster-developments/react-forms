import { FormControlOptions } from '@rolster/forms';
import { createFormControlOptions } from '@rolster/forms/arguments';
import {
  controlIsValid,
  hasError as rolsterHasError,
  someErrors as rolsterSomeErrors
} from '@rolster/forms/helpers';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactFormControl<E, T> {
  const _options = createFormControlOptions<T, ReactControlOptions<T>>(
    options,
    validators
  );

  const [state, setState] = useState<ControlState<T>>({
    dirty: false,
    disabled: false,
    focused: false,
    touched: !!_options.touched,
    validators: _options.validators,
    value: _options.value
  });

  const [errors, setErrors] = useState<ValidatorError<any>[]>([]);

  const initialValue = useRef<T>(_options.value);
  const elementRef = useRef<E>(null);

  useEffect(() => {
    setErrors(
      state.validators
        ? controlIsValid({
            value: state.value,
            validators: state.validators
          })
        : []
    );
  }, [state.value, state.validators]);

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

  const setInitialValue = useCallback((value: T) => {
    initialValue.current = value;
    setState((state) => ({ ...state, dirty: true, value }));
  }, []);

  const setValue = useCallback((value: T) => {
    setState((state) => ({ ...state, dirty: true, value }));
  }, []);

  const setValidators = useCallback((validators?: ValidatorFn<T>[]) => {
    setState((state) => ({ ...state, validators }));
  }, []);

  const reset = useCallback(() => {
    setState((state) => ({
      ...state,
      dirty: false,
      value: initialValue.current,
      touched: false
    }));
  }, []);

  const hasError = useCallback(
    (key: string) => rolsterHasError(errors, key),
    [errors]
  );

  const someErrors = useCallback(
    (keys: string[]) => rolsterSomeErrors(errors, keys),
    [errors]
  );

  const valid = errors.length === 0;

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
    hasError,
    invalid: !valid,
    pristine: !state.dirty,
    reset,
    setInitialValue,
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
