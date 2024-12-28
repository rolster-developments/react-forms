import { FormArrayControlOptions } from '@rolster/forms';
import { createFormControlOptions } from '@rolster/forms/arguments';
import { controlIsValid, hasError, someErrors } from '@rolster/forms/helpers';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { RefObject } from 'react';
import { v4 as uuid } from 'uuid';
import {
  ReactArrayControl,
  ReactArrayControlOptions,
  ReactHtmlArrayControl,
  ReactInputArrayControl,
  ReactSubscriberControl
} from '../types';

type BaseReactArrayControl<E extends HTMLElement = HTMLElement, T = any> = Omit<
  ReactArrayControl<E, T>,
  'clone' | 'invalid' | 'valid' | 'wrong'
>;

export class RolsterBaseArrayControl<
  E extends HTMLElement = HTMLElement,
  T = any
> implements BaseReactArrayControl<E, T>
{
  public readonly errors: ValidatorError<T>[];

  public readonly value: T;

  public readonly dirty: boolean;

  public readonly disabled: boolean;

  public readonly enabled: boolean;

  public readonly focused: boolean;

  public readonly pristine: boolean;

  public readonly touched: boolean;

  public readonly unfocused: boolean;

  public readonly uuid: string;

  public readonly untouched: boolean;

  public readonly error?: ValidatorError<T>;

  public readonly validators?: ValidatorFn<T>[];

  public elementRef?: RefObject<E>;

  private initialValue: T;

  protected subscriber?: ReactSubscriberControl<T>;

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
  }

  protected get currentInitialValue(): T {
    return this.initialValue;
  }

  public focus(): void {
    this.unfocused && this.refresh({ focused: true });
  }

  public blur(): void {
    this.focused && this.refresh({ focused: false, touched: true });
  }

  public disable(): void {
    this.enabled && this.refresh({ disabled: true });
  }

  public enable(): void {
    this.disabled && this.refresh({ disabled: false });
  }

  public touch(): void {
    this.untouched && this.refresh({ touched: true });
  }

  public setValue(value: T): void {
    this.refresh({ value });
  }

  public setValidators(validators?: ValidatorFn<T>[]): void {
    this.refresh({ validators });
  }

  public subscribe(subscriber: ReactSubscriberControl<T>): void {
    this.subscriber = subscriber;
  }

  public hasError(key: string): boolean {
    return hasError(this.errors, key);
  }

  public someErrors(keys: string[]): boolean {
    return someErrors(this.errors, keys);
  }

  public reset(): void {
    this.refresh({
      dirty: false,
      touched: false,
      value: this.currentInitialValue
    });
  }

  protected refresh(changes: Partial<ReactArrayControlOptions<T>>): void {
    this.subscriber &&
      this.subscriber({
        ...this,
        ...changes,
        initialValue: this.initialValue
      });
  }
}

export class RolsterArrayControl<E extends HTMLElement = HTMLElement, T = any>
  extends RolsterBaseArrayControl<E, T>
  implements ReactArrayControl<E, T>
{
  public readonly invalid: boolean;

  public readonly valid: boolean;

  public readonly wrong: boolean;

  constructor(options: ReactArrayControlOptions<T>) {
    super(options);

    this.valid = this.errors.length === 0;
    this.invalid = !this.valid;
    this.wrong = this.touched && this.invalid;
  }

  public clone(
    options: ReactArrayControlOptions<T>
  ): RolsterArrayControl<E, T> {
    return new RolsterArrayControl(options);
  }
}

interface ReactControlOptions<T = any>
  extends Omit<FormArrayControlOptions<T>, 'uuid'> {
  touched?: boolean;
}

function rolsterArrayControl<E extends HTMLElement = HTMLElement, T = any>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactArrayControl<E, T> {
  const controlOptions = createFormControlOptions<T, ReactControlOptions<T>>(
    options,
    validators
  );

  return new RolsterArrayControl({
    ...controlOptions,
    initialValue: controlOptions.value,
    uuid: uuid()
  });
}

type ReactValueOptions<T> = Omit<ReactControlOptions<T>, 'validators'>;
type ReactValidatorsOptions<T> = Omit<ReactControlOptions<T>, 'value'>;

export function reactArrayControl<
  E extends HTMLElement,
  T
>(): ReactArrayControl<E, T | undefined>;
export function reactArrayControl<E extends HTMLElement, T>(
  options: ReactValueOptions<T>
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
  return rolsterArrayControl(options, validators);
}

export function formArrayControl<T>(): ReactHtmlArrayControl<T | undefined>;
export function formArrayControl<T>(
  options: ReactValueOptions<T>
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
  return rolsterArrayControl<HTMLElement>(options, validators);
}

export function inputArrayControl<T>(): ReactInputArrayControl<T | undefined>;
export function inputArrayControl<T>(
  options: ReactValueOptions<T>
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
  return rolsterArrayControl<HTMLInputElement>(options, validators);
}
