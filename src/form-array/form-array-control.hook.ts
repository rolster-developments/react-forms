import { FormArrayControlOptions } from '@rolster/forms';
import { createFormControlOptions } from '@rolster/forms/arguments';
import { controlIsValid, hasError, someErrors } from '@rolster/forms/helpers';
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
  public readonly value: T;
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

  private initialValue: T;
  private subscriber?: ReactSubscriberControl<T>;

  constructor(options: ReactArrayControlOptions<T>) {
    this.initialValue = options.initialValue;
    this.uuid = options.uuid;
    this.focused = !!options.focused;
    this.unfocused = !this.focused;
    this.touched = !!options.touched;
    this.untouched = !this.touched;
    this.dirty = !!options.dirty;
    this.pristine = !this.dirty;
    this.disabled = !!options.disabled;
    this.enabled = !this.disabled;

    const { value, validators } = options;

    this.value = value;
    this.validators = validators;

    this.errors = validators ? controlIsValid({ value, validators }) : [];

    this.error = this.errors[0];
    this.valid = this.errors.length === 0;
    this.invalid = !this.valid;
    this.wrong = this.touched && this.invalid;
  }

  public focus(): void {
    this.unfocused && this.update({ focused: true });
  }

  public blur(): void {
    this.focused && this.update({ focused: false, touched: true });
  }

  public disable(): void {
    this.enabled && this.update({ disabled: true });
  }

  public enable(): void {
    this.disabled && this.update({ disabled: false });
  }

  public touch(): void {
    this.untouched && this.update({ touched: true });
  }

  public setValue(value: T): void {
    this.update({ value });
  }

  public setValidators(validators?: ValidatorFn<T>[]): void {
    this.update({ validators });
  }

  public subscribe(listener: ReactSubscriberControl<T>): void {
    this.subscriber = listener;
  }

  public hasError(key: string): boolean {
    return hasError(this.errors, key);
  }

  public someErrors(keys: string[]): boolean {
    return someErrors(this.errors, keys);
  }

  public reset(): void {
    this.update({ value: this.initialValue, dirty: false, touched: false });
  }

  private update(changes: Partial<ReactArrayControlOptions<T>>): void {
    this.subscriber &&
      this.subscriber({
        ...this,
        ...changes,
        initialValue: this.initialValue
      });
  }
}

interface ReactControlOptions<T = any>
  extends Omit<FormArrayControlOptions<T>, 'uuid'> {
  touched?: boolean;
}

function arrayControl<E extends HTMLElement = HTMLElement, T = any>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactArrayControl<E, T> {
  const controlOptions = createFormControlOptions<T, ReactControlOptions<T>>(
    options,
    validators
  );

  return new RolsterArrayControl({
    ...controlOptions,
    uuid: uuid(),
    initialValue: controlOptions.value
  });
}

type ReactStateOptions<T> = Omit<ReactControlOptions<T>, 'validators'>;
type ReactValidatorsOptions<T> = Omit<ReactControlOptions<T>, 'state'>;

export function reactArrayControl<
  E extends HTMLElement,
  T
>(): ReactArrayControl<E, T | undefined>;
export function reactArrayControl<E extends HTMLElement, T>(
  options: ReactStateOptions<T>
): ReactArrayControl<E, T>;
export function reactArrayControl<E extends HTMLElement, T>(
  options: ReactValidatorsOptions<T>
): ReactArrayControl<E, T | undefined>;
export function reactArrayControl<E extends HTMLElement, T>(
  options: ReactControlOptions<T>
): ReactArrayControl<E, T>;
export function reactArrayControl<E extends HTMLElement, T>(
  value: undefined,
  validators?: ValidatorFn<T>[]
): ReactArrayControl<E, T | undefined>;
export function reactArrayControl<E extends HTMLElement, T>(
  value: T,
  validators?: ValidatorFn<T>[]
): ReactArrayControl<E, T>;
export function reactArrayControl<E extends HTMLElement = HTMLElement, T = any>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactArrayControl<E, T> {
  return arrayControl(options, validators);
}

export function formArrayControl<T>(): ReactHtmlArrayControl<T | undefined>;
export function formArrayControl<T>(
  options: ReactStateOptions<T>
): ReactHtmlArrayControl<T>;
export function formArrayControl<T>(
  options: ReactValidatorsOptions<T>
): ReactHtmlArrayControl<T | undefined>;
export function formArrayControl<T>(
  options: ReactControlOptions<T>
): ReactHtmlArrayControl<T>;
export function formArrayControl<T>(
  value: undefined,
  validators?: ValidatorFn<T>[]
): ReactHtmlArrayControl<T | undefined>;
export function formArrayControl<T>(
  value: T,
  validators?: ValidatorFn<T>[]
): ReactHtmlArrayControl<T>;
export function formArrayControl<T = any>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactHtmlArrayControl<T> {
  return arrayControl<HTMLElement>(options, validators);
}

export function inputArrayControl<T>(): ReactInputArrayControl<T | undefined>;
export function inputArrayControl<T>(
  options: ReactStateOptions<T>
): ReactInputArrayControl<T>;
export function inputArrayControl<T>(
  options: ReactValidatorsOptions<T>
): ReactInputArrayControl<T | undefined>;
export function inputArrayControl<T>(
  options: ReactControlOptions<T>
): ReactInputArrayControl<T>;
export function inputArrayControl<T>(
  value: undefined,
  validators?: ValidatorFn<T>[]
): ReactInputArrayControl<T | undefined>;
export function inputArrayControl<T>(
  value: T,
  validators?: ValidatorFn<T>[]
): ReactInputArrayControl<T>;
export function inputArrayControl<T = any>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactInputArrayControl<T> {
  return arrayControl<HTMLInputElement>(options, validators);
}
