import { FormControlOptions, createFormControlOptions } from '@rolster/forms';
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
  state: T;
  touched: boolean;
  validators?: ValidatorFn<T>[];
}

function useControl<E extends HTMLElement, T = any>(
  controlOptions?: ReactControlOptions<T> | T,
  controlValidators?: ValidatorFn<T>[]
): ReactFormControl<E, T> {
  const { state, touched, validators } = createFormControlOptions<
    T,
    ReactControlOptions<T>
  >(controlOptions, controlValidators);

  const [controlState, setControlState] = useState<ControlState<T>>({
    dirty: false,
    disabled: false,
    focused: false,
    state: state,
    touched: !!touched,
    validators: validators
  });

  const initialState = useRef<T>(state);
  const elementRef = useRef<E>(null);

  const errors = validators ? controlIsValid({ state, validators }) : [];
  const error = errors[0];
  const valid = errors.length === 0;

  function focus(): void {
    setControlState((state) => ({ ...state, focused: true }));
  }

  function blur(): void {
    setControlState((state) => ({ ...state, focused: false }));
  }

  function disable(): void {
    setControlState((state) => ({ ...state, disabled: true }));
  }

  function enable(): void {
    setControlState((state) => ({ ...state, disabled: false }));
  }

  function touch(): void {
    setControlState((state) => ({ ...state, touched: true }));
  }

  function untouch(): void {
    setControlState((state) => ({ ...state, touched: false }));
  }

  function setState(state: T): void {
    setControlState((controlState) => ({
      ...controlState,
      dirty: true,
      state
    }));
  }

  function setValidators(validators?: ValidatorFn<T>[]): void {
    setControlState((state) => ({ ...state, validators }));
  }

  function reset(): void {
    setControlState((controlState) => ({
      ...controlState,
      dirty: false,
      state: initialState.current,
      touched: false
    }));
  }

  return {
    ...controlState,
    blur,
    disable,
    elementRef,
    enable,
    enabled: !controlState.disabled,
    error,
    errors,
    focus,
    invalid: !valid,
    pristine: !controlState.dirty,
    reset,
    setState,
    setValidators,
    touch,
    unfocused: !controlState.focused,
    untouch,
    untouched: !controlState.touched,
    valid,
    wrong: controlState.touched && !valid
  };
}

type ReactStateOptions<T> = Omit<ReactControlOptions<T>, 'validators'>;
type ReactValidatorsOptions<T> = Omit<ReactControlOptions<T>, 'state'>;

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
  state: T,
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
  state: T,
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
  state: T,
  validators?: ValidatorFn<T>[]
): ReactInputControl<T>;
export function useInputControl<T>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactInputControl<T> {
  return useControl<HTMLInputElement>(options, validators);
}
