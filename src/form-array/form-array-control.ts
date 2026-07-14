import { FormArrayControlOptions } from '@rolster/forms';
import {
  createFormControlOptions,
  formControlIsValid,
  hasError,
  someErrors
} from '@rolster/forms/helpers';
import { ValidatorError, ValidatorFn } from '@rolster/validators';

import { RefObject } from 'react';
import { v4 as uuid } from 'uuid';

import {
  ReactAreaArrayControl,
  ReactAreaArrayVoid,
  ReactArrayAction,
  ReactArrayControl,
  ReactArrayControlOptions,
  ReactArrayControlSubscriber,
  ReactHtmlArrayControl,
  ReactInputArrayControl
} from './form-array-control.type';

interface ArrayControlOptions<T = any> extends ReactArrayControlOptions<T> {
  errors: ValidatorError<T>[];
  valid?: boolean;
}

type Options<T = any> = Partial<ArrayControlOptions<T>>;

export class RolsterArrayControl<
  E extends HTMLElement = HTMLElement,
  T = any
> implements ReactArrayControl<E, T> {
  public readonly uuid: string;

  public readonly value: T;

  public readonly defaultValue: T;

  public readonly dirty: boolean;

  public readonly pristine: boolean;

  public readonly touched: boolean;

  public readonly untouched: boolean;

  public readonly focused: boolean;

  public readonly unfocused: boolean;

  public readonly disabled: boolean;

  public readonly enabled: boolean;

  public readonly valid: boolean;

  public readonly invalid: boolean;

  public readonly wrong: boolean;

  public readonly errors: ValidatorError<T>[];

  public readonly error?: ValidatorError<T>;

  public readonly validators?: ValidatorFn<T>[];

  public elementRef?: RefObject<E>;

  protected subscriber?: ReactArrayControlSubscriber<E, T>;

  constructor(options: ArrayControlOptions<T>) {
    this.uuid = options.uuid;
    this.defaultValue = options.defaultValue;
    this.value = options.value;
    this.focused = !!options.focused;
    this.unfocused = !this.focused;
    this.touched = !!options.touched;
    this.untouched = !this.touched;
    this.dirty = !!options.dirty;
    this.pristine = !this.dirty;
    this.disabled = !!options.disabled;
    this.enabled = !this.disabled;
    this.valid = this.isValid(options.errors);
    this.invalid = !this.valid;
    this.wrong = this.touched && this.invalid;

    this.errors = options.errors;
    this.error = this.errors[0];
    this.validators = options.validators;
  }

  public focus(): void {
    this.unfocused && this.refresh('focused', { focused: true });
  }

  public blur(): void {
    this.focused && this.refresh('focused', { focused: false, touched: true });
  }

  public disable(): void {
    this.enabled && this.refresh('disabled', { disabled: true });
  }

  public enable(): void {
    this.disabled && this.refresh('disabled', { disabled: false });
  }

  public touch(): void {
    this.untouched && this.refresh('touched', { touched: true });
  }

  public setDefaultValue(value: T): void {
    if (value !== this.defaultValue) {
      const errors = this.validators
        ? formControlIsValid({ value, validators: this.validators })
        : [];

      this.refresh('value', { errors, defaultValue: value, value });
    }
  }

  public setStartValue(value: T): void {
    if (value !== this.value) {
      const errors = this.validators
        ? formControlIsValid({ value, validators: this.validators })
        : [];

      this.refresh('value', { errors, value });
    }
  }

  public setValue(value: T): void {
    if (value !== this.value) {
      const errors = this.validators
        ? formControlIsValid({ value, validators: this.validators })
        : [];

      this.refresh('value', { dirty: true, errors, value });
    }
  }

  public setValidators(validators?: ValidatorFn<T>[] | undefined): void {
    const errors = validators
      ? formControlIsValid({ value: this.value, validators })
      : [];

    this.refresh('validators', { errors, validators });
  }

  public subscribe(subscriber: ReactArrayControlSubscriber<E, T>): void {
    this.subscriber = subscriber;
  }

  public hasError(key: string): boolean {
    return hasError(this.errors, key);
  }

  public someErrors(keys: string[]): boolean {
    return someErrors(this.errors, keys);
  }

  public reset(): void {
    const errors = this.validators
      ? formControlIsValid({
          value: this.defaultValue,
          validators: this.validators
        })
      : [];

    this.refresh('reset', {
      dirty: false,
      errors,
      touched: false,
      value: this.defaultValue
    });
  }

  protected isValid(errors: ValidatorError<T>[]): boolean {
    return errors.length === 0;
  }

  protected builder(options: Options<T>): ReactArrayControl<E, T> {
    return new RolsterArrayControl({ ...this, ...options });
  }

  protected refresh(action: ReactArrayAction, options: Options<T>): void {
    this.subscriber?.(action, this.builder(options));
  }
}

class ReactRolsterArrayControl<
  E extends HTMLElement = HTMLElement,
  T = any
> extends RolsterArrayControl<E, T> {
  constructor(options: ReactArrayControlOptions<T>) {
    const { value, validators } = options;
    const errors = validators ? formControlIsValid({ value, validators }) : [];

    super({ ...options, errors });
  }
}

interface ReactControlOptions<T = any> extends Omit<
  FormArrayControlOptions<T>,
  'uuid'
> {
  touched?: boolean;
}

function rolsterArrayControl<E extends HTMLElement = HTMLElement, T = any>(
  options?: ReactControlOptions<T> | T,
  validators?: ValidatorFn<T>[]
): ReactArrayControl<E, T> {
  const formControl = createFormControlOptions<T, ReactControlOptions<T>>(
    options,
    validators
  );

  return new ReactRolsterArrayControl({
    ...formControl,
    defaultValue: formControl.value,
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

export function areaArrayControl(): ReactAreaArrayVoid;
export function areaArrayControl(
  options: ReactValueOptions<string>
): ReactAreaArrayControl;
export function areaArrayControl(
  options: ReactControlOptions<string>
): ReactAreaArrayControl;
export function areaArrayControl(
  value: undefined,
  validators?: ValidatorFn<string>[]
): ReactAreaArrayVoid;
export function areaArrayControl(
  value: string,
  validators?: ValidatorFn<string>[]
): ReactAreaArrayControl;
export function areaArrayControl(
  options?: ReactControlOptions<string> | string,
  validators?: ValidatorFn<string>[]
): ReactAreaArrayControl | ReactAreaArrayVoid {
  return rolsterArrayControl<HTMLTextAreaElement>(options, validators);
}
