import { AbstractControl, AbstractFormControl } from '@rolster/forms';
import { RefObject } from 'react';

export interface ReactAbstractControl<
  E extends HTMLElement = HTMLElement,
  T = any
> extends AbstractControl<T> {
  elementRef?: RefObject<E>;
}

export interface ReactFormControl<
  E extends HTMLElement = HTMLElement,
  T = any
> extends AbstractFormControl<T> {
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
