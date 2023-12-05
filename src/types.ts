import {
  AbstractArray,
  AbstractArrayControl,
  AbstractArrayControls,
  AbstractArrayGroup,
  AbstractFormControl,
  AbstractFormGroup,
  AbstractGroupControls
} from '@rolster/helpers-forms';
import { LegacyRef } from 'react';

export interface ReactFormControl<E extends HTMLElement = HTMLElement, T = any>
  extends AbstractFormControl<T> {
  elementRef?: LegacyRef<E>;
}

export interface ReactArrayControl<E extends HTMLElement = HTMLElement, T = any>
  extends AbstractArrayControl<T> {
  elementRef?: LegacyRef<E>;
}

export type ReactControl<E extends HTMLElement = HTMLElement, T = any> =
  | ReactFormControl<E, T>
  | ReactArrayControl<E, T>;

export type ReactInputControl<T = any> = ReactFormControl<HTMLInputElement, T>;
export type ReactHtmlControl<T = any> = ReactFormControl<HTMLElement, T>;

export type ReactArrayInputControl<T = any> = ReactArrayControl<
  HTMLInputElement,
  T
>;
export type ReactArrayHtmlControl<T = any> = ReactArrayControl<HTMLElement, T>;

export type ReactControls = AbstractGroupControls<
  ReactFormControl<HTMLElement> | AbstractArray<any>
>;

export type ReactGroup<T extends ReactControls> = AbstractFormGroup<T>;

export type ReactArrayControls<
  T extends ReactArrayControl = ReactArrayControl
> = AbstractArrayControls<T>;

export type ReactArrayGroup<
  T extends ReactArrayControls,
  R = any
> = AbstractArrayGroup<T, R>;

export type ReactFormArray<
  T extends ReactArrayControls = ReactArrayControls,
  R = any
> = AbstractArray<T, R>;
