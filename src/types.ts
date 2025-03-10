import {
  AbstractArray,
  AbstractArrayControl,
  AbstractArrayControls,
  AbstractArrayGroup,
  AbstractArrayList,
  AbstractControls,
  AbstractFormControl,
  AbstractFormGroup,
  ArrayControlsValue,
  ArrayListValueToControls,
  FormArrayControlOptions
} from '@rolster/forms';
import { ValidatorFn } from '@rolster/validators';
import { RefObject } from 'react';
import { ReactAbstractControl } from './definitions';

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

export interface ReactArrayListOptions<
  C extends ReactArrayControls = ReactArrayControls
> extends ReactArrayControlOptions<ArrayControlsValue<C>[]> {
  controls: C[];
  valueToControls: ArrayListValueToControls<C>;
}

export type ReactArrayAction =
  | 'focused'
  | 'disabled'
  | 'touched'
  | 'value'
  | 'validators'
  | 'reset'
  | 'controls';

export interface ReactArrayControl<E extends HTMLElement = HTMLElement, T = any>
  extends AbstractArrayControl<T> {
  subscribe: (subscriber: ReactArrayControlSubscriber<E, T>) => void;
  elementRef?: RefObject<E>;
  validators?: ValidatorFn<T>[];
}

export type ReactArrayControlSubscriber<
  E extends HTMLElement = HTMLElement,
  T = any
> = (action: ReactArrayAction, control: ReactArrayControl<E, T>) => void;

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

export interface ReactArrayGroup<C extends ReactArrayControls, R = any>
  extends AbstractArrayGroup<C, R> {
  subscribe: (subscriber: ReactArrayGroupSubscriber<C, R>) => void;
}

export type ReactArrayGroupSubscriber<C extends ReactArrayControls, R = any> = (
  action: ReactArrayAction,
  control: ReactArrayGroup<C, R>
) => void;

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
