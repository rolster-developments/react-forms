import { FormArrayControlProps, FormState } from '@rolster/helpers-forms';
import { controlIsValid } from '@rolster/helpers-forms/helpers';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { RefObject } from 'react';
import { v4 as uuid } from 'uuid';
import { getReactControlProps } from '../form-control.hook';
import { ReactArrayControls } from '../types';
import {
  AbstractRolsterArrayControl,
  AbstractRolsterArrayGroup,
  AbtractFormArrayControlProps
} from './types';

export class RolsterArrayControl<
  T = any,
  C extends ReactArrayControls = ReactArrayControls,
  E extends HTMLElement = HTMLElement
> implements AbstractRolsterArrayControl<T, C, E>
{
  public readonly uuid: string;
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
  public readonly value: T;
  public readonly errors: ValidatorError<T>[];
  public readonly error?: ValidatorError<T>;
  public readonly state?: FormState<T>;
  public readonly validators?: ValidatorFn<T>[];

  private initialState?: FormState<T>;

  group?: AbstractRolsterArrayGroup<C>;
  elementRef?: RefObject<E>;

  constructor(props: AbtractFormArrayControlProps<T>) {
    const {
      uuid,
      focused,
      dirty,
      disabled,
      initialState,
      state,
      touched,
      validators
    } = props;

    this.uuid = uuid;
    this.focused = focused || false;
    this.unfocused = !this.focused;
    this.touched = touched || false;
    this.untouched = !this.touched;
    this.dirty = dirty || false;
    this.pristine = !this.dirty;
    this.disabled = disabled || false;
    this.enabled = !this.disabled;
    this.state = state;
    this.validators = validators;
    this.initialState = initialState;

    this.errors = validators ? controlIsValid({ state, validators }) : [];

    this.error = this.errors[0];
    this.valid = this.errors.length === 0;
    this.invalid = !this.valid;
    this.wrong = this.touched && this.invalid;
    this.value = state as T;
  }

  public focus(): void {
    if (!this.focused) {
      this.update({ focused: true });
    }
  }

  public blur(): void {
    if (this.focused) {
      this.update({ focused: false });
    }
  }

  public touch(): void {
    if (!this.touched) {
      this.update({ touched: true });
    }
  }

  public untouch(): void {
    if (this.touched) {
      this.update({ touched: false });
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

  public setState(state?: FormState<T>): void {
    this.update({ state });
  }

  public setValidators(validators?: ValidatorFn<T>[]): void {
    this.update({ validators });
  }

  public reset(): void {
    this.update({ state: this.initialState });
  }

  private update(changes: Partial<AbtractFormArrayControlProps<T>>): void {
    this.group?.parent?.refreshControl(this, {
      ...changes,
      initialState: this.initialState
    });
  }
}

interface RolsterControlProps<T = any> extends FormArrayControlProps<T> {
  touched?: boolean;
}

type ReactControlProps<T = any> = Omit<RolsterControlProps<T>, 'uuid'>;

export function useFormArrayControl<
  T = any,
  C extends ReactArrayControls = any,
  E extends HTMLElement = HTMLElement
>(): AbstractRolsterArrayControl<T, C, E>;
export function useFormArrayControl<
  T = any,
  C extends ReactArrayControls = any,
  E extends HTMLElement = HTMLElement
>(props: ReactControlProps<T>): AbstractRolsterArrayControl<T, C, E>;
export function useFormArrayControl<
  T = any,
  C extends ReactArrayControls = any,
  E extends HTMLElement = HTMLElement
>(
  state: FormState<T>,
  validators?: ValidatorFn<T>[]
): AbstractRolsterArrayControl<T, C, E>;
export function useFormArrayControl<
  T = any,
  C extends ReactArrayControls = any,
  E extends HTMLElement = HTMLElement
>(
  reactProps?: ReactControlProps<T> | FormState<T>,
  validators?: ValidatorFn<T>[]
): AbstractRolsterArrayControl<T, C, E> {
  const props = getReactControlProps(reactProps, validators);

  return new RolsterArrayControl({
    ...props,
    uuid: uuid(),
    initialState: props.state
  });
}

export function useInputArrayControl<
  T = any,
  C extends ReactArrayControls = any
>(): AbstractRolsterArrayControl<T, C, HTMLInputElement>;
export function useInputArrayControl<
  T = any,
  C extends ReactArrayControls = any
>(
  props: ReactControlProps<T>
): AbstractRolsterArrayControl<T, C, HTMLInputElement>;
export function useInputArrayControl<
  T = any,
  C extends ReactArrayControls = any
>(
  state: FormState<T>,
  validators?: ValidatorFn<T>[]
): AbstractRolsterArrayControl<T, C, HTMLInputElement>;
export function useInputArrayControl<
  T = any,
  C extends ReactArrayControls = any
>(
  reactProps?: ReactControlProps<T> | FormState<T>,
  validators?: ValidatorFn<T>[]
): AbstractRolsterArrayControl<T, C, HTMLInputElement> {
  const props = getReactControlProps(reactProps, validators);

  return new RolsterArrayControl({
    ...props,
    uuid: uuid(),
    initialState: props.state
  });
}
