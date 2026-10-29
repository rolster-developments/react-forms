import { FormatterOptions, FormControlOptions } from '@rolster/forms';
import {
  createFormControlOptions,
  formatBlurValue,
  formatInputValue,
  hasError,
  someErrors
} from '@rolster/forms/helpers';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { errorsInControl } from './form-control.helper';
import {
  ReactAreaControl,
  ReactAreaVoid,
  ReactFormControl,
  ReactHtmlControl,
  ReactInputControl,
  ValueSetter
} from './form-control.type';

interface ReactControlOptions<T = any> extends FormControlOptions<T> {
  touched?: boolean;
}

interface ControlState<T = any> {
  dirty: boolean;
  disabled: boolean;
  errors: ValidatorError<any>[];
  focused: boolean;
  touched: boolean;
  value: T;
  validators?: ValidatorFn<T>[];
}

function valueIsSetter<T>(value: T | ValueSetter<T>): value is ValueSetter<T> {
  return typeof value === 'function';
}

function useControl<E extends HTMLElement, T = any>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactFormControl<E, T> {
  const formControl = createFormControlOptions<T, ReactControlOptions<T>>(
    options,
    validators
  );

  const format = useRef<FormatterOptions<T>>({
    formatOn: formControl.formatOn,
    formatter: formControl.formatter
  });

  useEffect(() => {
    format.current = {
      formatOn: formControl.formatOn,
      formatter: formControl.formatter
    };
  }, [formControl.formatOn, formControl.formatter]);

  const defaultValue = useRef<T>(
    formatInputValue(formControl.value, formControl)
  );

  const [state, setState] = useState<ControlState<T>>(() => {
    const value = defaultValue.current;

    return {
      dirty: false,
      disabled: false,
      errors: errorsInControl(value, formControl.validators),
      focused: false,
      touched: !!formControl.touched,
      value,
      validators: formControl.validators
    };
  });

  const elementRef = useRef<E>(null);

  const focus = useCallback(() => {
    setState((state) => ({ ...state, focused: true }));
  }, []);

  const blur = useCallback(() => {
    setState((state) => {
      const value = formatBlurValue(state.value, format.current);

      if (Object.is(value, state.value)) {
        return { ...state, focused: false, touched: true };
      }

      return {
        ...state,
        errors: errorsInControl(value, state.validators),
        focused: false,
        touched: true,
        value
      };
    });
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
    const defaultFormatted = formatInputValue(value, format.current);

    defaultValue.current = defaultFormatted;

    setState((state) => ({
      ...state,
      errors: errorsInControl(defaultFormatted, state.validators),
      value: defaultFormatted
    }));
  }, []);

  const setStartValue = useCallback((value: T) => {
    const startValue = formatInputValue(value, format.current);

    setState((state) => ({
      ...state,
      errors: errorsInControl(startValue, state.validators),
      value: startValue
    }));
  }, []);

  const setValue = useCallback((value: T | ValueSetter<T>) => {
    setState((state) => {
      const currentValue = valueIsSetter(value) ? value(state.value) : value;
      const newValue = formatInputValue(currentValue, format.current);

      if (Object.is(newValue, state.value)) {
        return state;
      }

      return {
        ...state,
        dirty: true,
        errors: errorsInControl(newValue, state.validators),
        value: newValue
      };
    });
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

  const formControlHasError = useCallback(
    (key: string) => {
      return hasError(state.errors, key);
    },
    [state.errors]
  );

  const formControlSomeErrors = useCallback(
    (keys: string[]) => {
      return someErrors(state.errors, keys);
    },
    [state.errors]
  );

  return useMemo(() => {
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
      formatOn: format.current.formatOn,
      formatter: format.current.formatter,
      hasError: formControlHasError,
      invalid: !valid,
      pristine: !state.dirty,
      reset,
      setDefaultValue,
      setStartValue,
      setValidators,
      setValue,
      someErrors: formControlSomeErrors,
      touch,
      unfocused: !state.focused,
      untouched: !state.touched,
      valid,
      wrong: state.touched && !valid
    };
  }, [state]);
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
  value: T,
  validators?: ValidatorFn<T>[]
): ReactFormControl<E, T>;
export function useReactControl<E extends HTMLElement, T>(
  value: Undefined<T>,
  validators?: ValidatorFn<T>[]
): ReactFormControl<E, T | undefined>;
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
  value: T,
  validators?: ValidatorFn<T>[]
): ReactHtmlControl<T>;
export function useFormControl<T>(
  value: Undefined<T>,
  validators?: ValidatorFn<T>[]
): ReactHtmlControl<T | undefined>;
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
  value: T,
  validators?: ValidatorFn<T>[]
): ReactInputControl<T>;
export function useInputControl<T>(
  value: Undefined<T>,
  validators?: ValidatorFn<T>[]
): ReactInputControl<T | undefined>;
export function useInputControl<T>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactInputControl<T> {
  return useControl<HTMLInputElement>(options, validators);
}

export function useAreaControl(): ReactAreaVoid;
export function useAreaControl(
  options: ReactValueOptions<string>
): ReactAreaControl;
export function useAreaControl(
  options: ReactControlOptions<string>
): ReactAreaControl;
export function useAreaControl(
  value: string,
  validators?: ValidatorFn<string>[]
): ReactAreaControl;
export function useAreaControl(
  value: Undefined<string>,
  validators?: ValidatorFn<string>[]
): ReactAreaVoid;
export function useAreaControl(
  options?: ReactControlOptions<string> | string,
  validators?: ValidatorFn<string>[]
): ReactAreaControl | ReactAreaVoid {
  return useControl<HTMLTextAreaElement>(options, validators);
}
