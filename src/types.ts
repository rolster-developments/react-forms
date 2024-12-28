import {
  AbstractArray,
  AbstractArrayControl,
  AbstractArrayControls,
  AbstractArrayGroup,
  AbstractArrayList,
  AbstractControl,
  AbstractControls,
  AbstractFormControl,
  AbstractFormGroup,
  ArrayControlsValue,
  ArrayListValueToControls,
  FormArrayControlOptions,
  FormArrayGroupOptions
} from '@rolster/forms';
import { ValidatorFn } from '@rolster/validators';
import { RefObject } from 'react';

interface ReactAbstractControl<E extends HTMLElement = HTMLElement, T = any>
  extends AbstractControl<T> {
  elementRef?: RefObject<E>;
}

export interface ReactFormControl<E extends HTMLElement = HTMLElement, T = any>
  extends AbstractFormControl<T> {
  elementRef?: RefObject<E>;
}

export type ReactFormVoid<
  E extends HTMLElement = HTMLElement,
  T = any
> = ReactFormControl<E, T | undefined>;

export type ReactHtmlControl<T = any> = ReactFormControl<HTMLElement, T>;
export type ReactHtmlVoid<T = any> = ReactFormVoid<HTMLElement, T>;
export type ReactInputControl<T = any> = ReactFormControl<HTMLInputElement, T>;
export type ReactInputVoid<T = any> = ReactFormVoid<HTMLInputElement, T>;

export interface ReactArrayControlOptions<T = any>
  extends FormArrayControlOptions<T> {
  initialValue: T;
  dirty?: boolean;
  disabled?: boolean;
  focused?: boolean;
  touched?: boolean;
}

export type ReactSubscriberControl<T = any> = (
  options: ReactArrayControlOptions<T>
) => void;

export interface ReactArrayListOptions<
  C extends ReactArrayControls = ReactArrayControls
> extends ReactArrayControlOptions<ArrayControlsValue<C>[]> {
  valueToControls: ArrayListValueToControls<C>;
}

export interface ReactArrayControl<E extends HTMLElement = HTMLElement, T = any>
  extends AbstractArrayControl<T> {
  clone(options: ReactArrayControlOptions<T>): ReactArrayControl<E, T>;
  subscribe: (subscriber: ReactSubscriberControl<T>) => void;
  elementRef?: RefObject<E>;
  validators?: ValidatorFn<T>[];
}

export type ReactArrayVoid<
  E extends HTMLElement = HTMLElement,
  T = any
> = ReactArrayControl<E, T | undefined>;

export type ReactHtmlArrayControl<T = any> = ReactArrayControl<HTMLElement, T>;
export type ReactHtmlArrayVoid<T = any> = ReactArrayVoid<HTMLElement, T>;
export type ReactInputArrayControl<T = any> = ReactArrayControl<
  HTMLInputElement,
  T
>;
export type ReactInputArrayVoid<T = any> = ReactArrayVoid<HTMLInputElement, T>;

export type ReactArrayControls<
  T extends ReactArrayControl = ReactArrayControl
> = AbstractArrayControls<T>;

export interface ReactArrayList<
  C extends ReactArrayControls = ReactArrayControls
> extends ReactArrayControl<HTMLElement, ArrayControlsValue<C>[]>,
    AbstractArrayList<C> {}

export type ReactSubscriberGroup<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
> = (options: FormArrayGroupOptions<C, R>) => void;

export interface ReactArrayGroup<C extends ReactArrayControls, R = any>
  extends AbstractArrayGroup<C, R> {
  subscribe: (subscriber: ReactSubscriberGroup<C, R>) => void;
}

export interface ReactFormArray<
  C extends ReactArrayControls = ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
> extends AbstractArray<C, R, G> {
  elementRef?: RefObject<HTMLElement>;
}

export type ReactControl<E extends HTMLElement = HTMLElement, T = any> =
  | ReactFormControl<E, T>
  | ReactArrayControl<E, T>;

export type ReactControls<
  T extends ReactAbstractControl = ReactAbstractControl
> = AbstractControls<T>;

export type ReactGroup<C extends ReactControls = ReactControls> =
  AbstractFormGroup<C>;
