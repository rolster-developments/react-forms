import {
  AbstractArray,
  AbstractArrayControl,
  AbstractArrayControls,
  AbstractArrayGroup,
  AbstractControls,
  AbstractFormControl,
  StateGroup,
  ValidatorGroupFn
} from '@rolster/forms';
import { RefObject } from 'react';

type ReactControl<T = any> = Omit<AbstractFormControl<T>, 'subscribe'>;

export interface ReactFormControl<E extends HTMLElement = HTMLElement, T = any>
  extends ReactControl<T> {
  elementRef?: RefObject<E>;
}

export type ReactInputControl<T = any> = ReactFormControl<HTMLInputElement, T>;
export type ReactHtmlControl<T = any> = ReactFormControl<HTMLElement, T>;

// export type ReactFormGroup<T extends ReactControlsX = ReactControlsX> = Omit<
//   AbstractFormGroup<T>,
//   'subscribe'
// >;

// export interface ReactArrayControl<E extends HTMLElement = HTMLElement, T = any>
//   extends AbstractArrayControl<T> {
//   elementRef?: RefObject<E>;
// }

// export type ReactArrayInputControl<T = any> = ReactArrayControl<
//   HTMLInputElement,
//   T
// >;
// export type ReactArrayHtmlControl<T = any> = ReactArrayControl<HTMLElement, T>;

// export type ReactArrayControls<
//   T extends ReactArrayControl = ReactArrayControl
// > = AbstractArrayGroupControls<T>;

// export type ReactArrayGroup<
//   T extends ReactArrayControls,
//   R = any
// > = AbstractArrayGroup<T, R>;

// export type ReactFormArray<
//   T extends ReactArrayControls = ReactArrayControls,
//   R = any
// > = AbstractArray<T, R>;
