import {
  FormArrayControlProps,
  FormArrayGroupProps,
  FormState,
  ValidatorGroupFn
} from '@rolster/forms';
import { ValidatorFn } from '@rolster/validators';
import {
  ReactArrayControl,
  ReactArrayControls,
  ReactArrayGroup,
  ReactFormArray
} from '../types';

export type RolsterArrayControls =
  ReactArrayControls<AbstractRolsterArrayControl>;

export interface AbtractFormArrayControlProps<T = any>
  extends FormArrayControlProps<T> {
  dirty?: boolean;
  disabled?: boolean;
  initialState?: FormState<T>;
  focused?: boolean;
  touched?: boolean;
}

export interface AbstractRolsterArrayControl<
  T = any,
  C extends ReactArrayControls = any,
  E extends HTMLElement = HTMLElement
> extends ReactArrayControl<E, T> {
  group?: AbstractRolsterArrayGroup<C>;
  validators?: ValidatorFn<T>[];
}

export interface RolsterFormArray<C extends ReactArrayControls>
  extends ReactFormArray<C> {
  refreshControl(
    control: AbstractRolsterArrayControl<any, C>,
    changes: Partial<AbtractFormArrayControlProps<any>>
  ): void;

  refreshGroup(
    group: AbstractRolsterArrayGroup<C>,
    changes: Partial<FormArrayGroupProps<C>>
  ): void;
}

export interface AbstractRolsterArrayGroup<
  C extends RolsterArrayControls = RolsterArrayControls,
  R = any
> extends ReactArrayGroup<C, R> {
  parent?: RolsterFormArray<C>;
  validators?: ValidatorGroupFn<C>[];
}
