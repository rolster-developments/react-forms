import { FormArrayControlOptions } from '@rolster/forms';
import { createFormControlOptions } from '@rolster/forms/arguments';
import { controlIsValid } from '@rolster/forms/helpers';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { RefObject } from 'react';
import { v4 as uuid } from 'uuid';
import {
  ReactArrayControl,
  ReactArrayControlOptions,
  ReactSubscriberControl,
  ReactHtmlArrayControl,
  ReactInputArrayControl
} from '../types';

export class RolsterArrayControl<E extends HTMLElement = HTMLElement, T = any>
  implements ReactArrayControl<E, T>
{
  public readonly uuid: string;
  public readonly state: T;
  public readonly focused: boolean;
  public readonly unfocused: boolean;
  public readonly disabled: boolean;
  public readonly enabled: boolean;
  public readonly touched: boolean;
  public readonly untouched: boolean;
  public readonly dirty: boolean;
  public readonly pristine: boolean;
  public readonly valid: boolean;
  public readonly invalid: boolean;
  public readonly wrong: boolean;
  public readonly errors: ValidatorError<T>[];
  public readonly error?: ValidatorError<T>;
  public readonly validators?: ValidatorFn<T>[];

  elementRef?: RefObject<E>;

  private initialState: T;
  private subscriber?: ReactSubscriberControl<T>;

  constructor(options: ReactArrayControlOptions<T>) {
    this.initialState = options.initialState;
    this.uuid = options.uuid;
    this.focused = !!options.focused;
    this.unfocused = !this.focused;
    this.touched = !!options.touched;
    this.untouched = !this.touched;
    this.dirty = !!options.dirty;
    this.pristine = !this.dirty;
    this.disabled = !!options.disabled;
    this.enabled = !this.disabled;

    const { state, validators } = options;

    this.state = state;
    this.validators = validators;

    this.errors = validators ? controlIsValid({ state, validators }) : [];

    this.error = this.errors[0];
    this.valid = this.errors.length === 0;
    this.invalid = !this.valid;
    this.wrong = this.touched && this.invalid;
  }

  public focus(): void {
    if (!this.focused) {
      this.update({ focused: true });
    }
  }

  public blur(): void {
    if (this.focused) {
      this.update({ focused: false, touched: true });
    }
  }

  public disable(): void {
    if (!this.disabled) {
      this.update({ disabled: true });
    }
  }

  public enable(): void {
    if (this.disabled) {
      this.update({ disabled: false });
    }
  }

  public touch(): void {
    if (this.touched) {
      this.update({ touched: true });
    }
  }

  public setState(state: T): void {
    this.update({ state });
  }

  public setValidators(validators?: ValidatorFn<T>[]): void {
    this.update({ validators });
  }

  public subscribe(listener: ReactSubscriberControl<T>): void {
    this.subscriber = listener;
  }

  public reset(): void {
    this.update({ state: this.initialState, dirty: false, touched: false });
  }

  private update(changes: Partial<ReactArrayControlOptions<T>>): void {
    if (this.subscriber) {
      this.subscriber({
        ...this,
        ...changes,
        initialState: this.initialState
      });
    }
  }
}

interface RolsterControlOptions<T = any>
  extends Omit<FormArrayControlOptions<T>, 'uuid'> {
  touched?: boolean;
}

function useArrayControl<E extends HTMLElement = HTMLElement, T = any>(
  options?: RolsterControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactArrayControl<E, T> {
  const controlOptions = createFormControlOptions<T, RolsterControlOptions<T>>(
    options,
    validators
  );

  return new RolsterArrayControl({
    ...controlOptions,
    uuid: uuid(),
    initialState: controlOptions.state
  });
}

type ReactStateOptions<T> = Omit<RolsterControlOptions<T>, 'validators'>;
type ReactValidatorsOptions<T> = Omit<RolsterControlOptions<T>, 'state'>;

export function useReactArrayControl<
  E extends HTMLElement,
  T
>(): ReactArrayControl<E, T | undefined>;
export function useReactArrayControl<E extends HTMLElement, T>(
  options: ReactStateOptions<T>
): ReactArrayControl<E, T>;
export function useReactArrayControl<E extends HTMLElement, T>(
  options: ReactValidatorsOptions<T>
): ReactArrayControl<E, T | undefined>;
export function useReactArrayControl<E extends HTMLElement, T>(
  state: T,
  validators?: ValidatorFn<T>[]
): ReactArrayControl<E, T>;
export function useReactArrayControl<
  E extends HTMLElement = HTMLElement,
  T = any
>(
  options?: RolsterControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactArrayControl<E, T> {
  return useArrayControl(options, validators);
}

export function useFormArrayControl<T>(): ReactHtmlArrayControl<T | undefined>;
export function useFormArrayControl<T>(
  options: ReactStateOptions<T>
): ReactHtmlArrayControl<T>;
export function useFormArrayControl<T>(
  options: ReactValidatorsOptions<T>
): ReactHtmlArrayControl<T | undefined>;
export function useFormArrayControl<T>(
  state: T,
  validators?: ValidatorFn<T>[]
): ReactHtmlArrayControl<T>;
export function useFormArrayControl<T = any>(
  options?: RolsterControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactHtmlArrayControl<T> {
  return useArrayControl<HTMLElement>(options, validators);
}

export function useInputArrayControl<T>(): ReactInputArrayControl<
  T | undefined
>;
export function useInputArrayControl<T>(
  options: ReactStateOptions<T>
): ReactInputArrayControl<T>;
export function useInputArrayControl<T>(
  options: ReactValidatorsOptions<T>
): ReactInputArrayControl<T | undefined>;
export function useInputArrayControl<T>(
  state: T,
  validators?: ValidatorFn<T>[]
): ReactInputArrayControl<T>;
export function useInputArrayControl<T = any>(
  options?: RolsterControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactInputArrayControl<T> {
  return useArrayControl<HTMLInputElement>(options, validators);
}
