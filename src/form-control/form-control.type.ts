import { AbstractFormControl, AbstractValueControl } from '@rolster/forms';
import { RefObject } from 'react';

export interface ReactAbstractControl<
  E extends HTMLElement = HTMLElement,
  T = any
> extends AbstractValueControl<T> {
  elementRef?: RefObject<E | null>;
}

export type ValueSetter<T> = (current: T) => T;

export type ReactValueSetter<T> = (value: T | ValueSetter<T>) => void;

export interface ReactFormControl<
  E extends HTMLElement = HTMLElement,
  T = any
> extends AbstractFormControl<T> {
  setValue: ReactValueSetter<T>;
  elementRef?: RefObject<E | null>;
}

export type ReactFormVoid<
  E extends HTMLElement = HTMLElement,
  T = any
> = ReactFormControl<E, T | undefined>;

export type ReactHtmlControl<T = any> = ReactFormControl<HTMLElement, T>;
export type ReactHtmlVoid<T = any> = ReactFormVoid<HTMLElement, T>;
export type ReactInputControl<T = any> = ReactFormControl<HTMLInputElement, T>;
export type ReactAreaControl = ReactFormControl<HTMLTextAreaElement, string>;
export type ReactInputVoid<T = any> = ReactFormVoid<HTMLInputElement, T>;
export type ReactAreaVoid = ReactFormVoid<HTMLTextAreaElement, string>;
