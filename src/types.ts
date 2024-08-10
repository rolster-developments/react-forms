import {
  AbstractArray,
  AbstractArrayControl,
  AbstractArrayControls,
  AbstractArrayGroup,
  AbstractControls,
  AbstractFormControl,
  AbstractFormGroup,
  FormArrayControlOptions,
  FormArrayGroupOptions
} from '@rolster/forms';
import { ValidatorFn } from '@rolster/validators';
import { RefObject } from 'react';

export interface ReactFormControl<E extends HTMLElement = HTMLElement, T = any>
  extends AbstractFormControl<T> {
  elementRef?: RefObject<E>;
}

export type ReactHtmlControl<T = any> = ReactFormControl<HTMLElement, T>;
export type ReactInputControl<T = any> = ReactFormControl<HTMLInputElement, T>;

export type ReactControls<T extends ReactFormControl = ReactFormControl> =
  AbstractControls<T>;

export type ReactGroup<C extends ReactControls = ReactControls> =
  AbstractFormGroup<C>;

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

export interface ReactArrayControl<E extends HTMLElement = HTMLElement, T = any>
  extends AbstractArrayControl<T> {
  subscribe: (subscriber: ReactSubscriberControl<T>) => void;
  elementRef?: RefObject<E>;
  validators?: ValidatorFn<T>[];
}

export type ReactHtmlArrayControl<T = any> = ReactArrayControl<HTMLElement, T>;
export type ReactInputArrayControl<T = any> = ReactArrayControl<
  HTMLInputElement,
  T
>;

export type ReactArrayControls<
  T extends ReactArrayControl = ReactArrayControl
> = AbstractArrayControls<T>;

export type ReactSubscriberGroup<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
> = (options: FormArrayGroupOptions<C, R>) => void;

export interface ReactArrayGroup<C extends ReactArrayControls, R = any>
  extends AbstractArrayGroup<C, R> {
  subscribe: (subscriber: ReactSubscriberGroup<C, R>) => void;
}

export type ReactFormArray<
  C extends ReactArrayControls = ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
> = AbstractArray<C, R, G>;

export type ReactControl<E extends HTMLElement = HTMLElement, T = any> =
  | ReactFormControl<E, T>
  | ReactArrayControl<E, T>;
