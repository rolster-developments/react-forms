import {
  FormControlProps,
  FormState,
  SubscriberControl
} from '@rolster/helpers-forms';
import { controlIsValid } from '@rolster/helpers-forms/helpers';
import { ValidatorFn } from '@rolster/validators';
import { useEffect, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { ReactFormControl, ReactHtmlControl, ReactInputControl } from './types';

interface ReactControlProps<T = any> extends FormControlProps<T> {
  touched?: boolean;
}

export function instanceOfReactControlProps<T = any>(
  props: any
): props is ReactControlProps<T> {
  return (
    typeof props === 'object' && ('state' in props || 'validators' in props)
  );
}

export function getReactControlProps<T = any>(
  props?: ReactControlProps<T> | FormState<T>,
  validators?: ValidatorFn<T>[]
): ReactControlProps<T> {
  if (props === undefined || props === null) {
    return { state: undefined, validators: undefined };
  }

  if (instanceOfReactControlProps<T>(props)) {
    return props;
  }

  const state = props as FormState<T>;

  return { state, validators };
}

export function useReactControl<
  E extends HTMLElement,
  T = any
>(): ReactFormControl<E, T>;
export function useReactControl<E extends HTMLElement, T = any>(
  props: ReactControlProps<T>
): ReactFormControl<E, T>;
export function useReactControl<E extends HTMLElement, T = any>(
  state: FormState<T>,
  validators?: ValidatorFn<T>[]
): ReactFormControl<E, T>;
export function useReactControl<E extends HTMLElement, T = any>(
  reactProps?: ReactControlProps<T> | FormState<T>,
  validatorsFn?: ValidatorFn<T>[]
): ReactFormControl<E, T> {
  const props = getReactControlProps(reactProps, validatorsFn);

  const [state, setCurrentState] = useState<FormState<T>>(props.state);
  const [value, setValue] = useState<T>(props.state as T);
  const [touched, setTouched] = useState<boolean>(props.touched || false);
  const [dirty, setDirty] = useState<boolean>(false);
  const [focused, setFocused] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [initialValue] = useState<FormState<T>>(props.state);
  const [validators, setValidators] = useState(props.validators);
  const [subscribers] = useState<BehaviorSubject<FormState<T>>>(
    new BehaviorSubject(props.state)
  );

  const elementRef = useRef<E>(null);

  const errors = (() =>
    validators ? controlIsValid({ state, validators }) : [])();

  const error = (() => errors[0])();
  const valid = (() => errors.length === 0)();

  useEffect(() => {
    if (state !== null && state !== undefined) {
      setValue(state);
    }

    subscribers.next(state);
  }, [state]);

  function focus(): void {
    setFocused(true);
  }

  function blur(): void {
    setFocused(false);
  }

  function disable(): void {
    setDisabled(true);
  }

  function enable(): void {
    setDisabled(false);
  }

  function touch(): void {
    setTouched(true);
  }

  function untouch(): void {
    setTouched(false);
  }

  function setState(state?: FormState<T>): void {
    setDirty(true);
    setCurrentState(state);
  }

  function reset(): void {
    setTouched(false);
    setDirty(false);
    setCurrentState(initialValue);
  }

  function subscribe(subscriber: SubscriberControl<T>): Unsubscription {
    const subscription = subscribers.subscribe(subscriber);

    return () => subscription.unsubscribe();
  }

  return {
    blur,
    dirty,
    disable,
    disabled,
    elementRef,
    enable,
    enabled: !disabled,
    error,
    errors,
    focus,
    focused,
    invalid: !valid,
    pristine: !dirty,
    reset,
    setState,
    setValidators,
    state,
    subscribe,
    touch,
    touched,
    unfocused: !focused,
    untouch,
    untouched: !touched,
    valid,
    value,
    wrong: touched && !valid
  };
}

export function useFormControl<T = any>(): ReactHtmlControl<T>;
export function useFormControl<T = any>(
  props: ReactControlProps<T>
): ReactHtmlControl<T>;
export function useFormControl<T = any>(
  state: FormState<T>,
  validators?: ValidatorFn<T>[]
): ReactHtmlControl<T>;
export function useFormControl<T = any>(
  reactProps?: ReactControlProps<T> | FormState<T>,
  validatorsFn?: ValidatorFn<T>[]
): ReactHtmlControl<T> {
  return instanceOfReactControlProps<T>(reactProps)
    ? useReactControl<HTMLElement, T>(reactProps)
    : useReactControl<HTMLElement, T>(reactProps, validatorsFn);
}

export function useInputControl<T = any>(): ReactInputControl<T>;
export function useInputControl<T = any>(
  props: ReactControlProps<T>
): ReactInputControl<T>;
export function useInputControl<T = any>(
  state: FormState<T>,
  validators?: ValidatorFn<T>[]
): ReactInputControl<T>;
export function useInputControl<T = any>(
  reactProps?: ReactControlProps<T> | FormState<T>,
  validatorsFn?: ValidatorFn<T>[]
): ReactInputControl<T> {
  return instanceOfReactControlProps<T>(reactProps)
    ? useReactControl<HTMLInputElement, T>(reactProps)
    : useReactControl<HTMLInputElement, T>(reactProps, validatorsFn);
}
