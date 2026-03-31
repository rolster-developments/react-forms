import { AbstractArrayControl, FormArrayControlOptions } from '@rolster/forms';
import { ValidatorFn } from '@rolster/validators';
import { RefObject } from 'react';

export interface ReactArrayControlOptions<
  T = any
> extends FormArrayControlOptions<T> {
  defaultValue: T;
  dirty?: boolean;
  disabled?: boolean;
  focused?: boolean;
  touched?: boolean;
}

export type ReactArrayAction =
  | 'focused'
  | 'disabled'
  | 'touched'
  | 'value'
  | 'validators'
  | 'reset'
  | 'list'
  | 'resource';

export interface ReactArrayControl<
  E extends HTMLElement = HTMLElement,
  T = any
> extends AbstractArrayControl<T> {
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
