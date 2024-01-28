import { ValidatorError, ValidatorFn } from '@rolster/validators';
import {
  ArrayStateGroup,
  ArrayValueGroup,
  FormArrayControlProps,
  FormArrayGroupProps,
  FormArrayProps,
  FormState,
  ValidatorGroupFn
} from '@rolster/helpers-forms';
import {
  arrayIsValid,
  controlIsValid,
  controlsAllChecked,
  controlsPartialChecked,
  controlsToState,
  controlsToValue,
  groupAllChecked,
  groupIsValid,
  groupPartialChecked
} from '@rolster/helpers-forms/helpers';
import { LegacyRef, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import {
  ReactArrayControl,
  ReactArrayControls,
  ReactArrayGroup,
  ReactFormArray
} from './types';

interface AbtractFormArrayControlProps<T = any>
  extends FormArrayControlProps<T> {
  focused?: boolean;
  dirty?: boolean;
  disabled?: boolean;
  touched?: boolean;
}

interface AbstractRolsterArrayControl<
  T = any,
  C extends ReactArrayControls = any,
  E extends HTMLElement = HTMLElement
> extends ReactArrayControl<E, T> {
  parentGroup?: AbstractRolsterArrayGroup<C>;
  validators?: ValidatorFn<T>[];
}

type RolsterArrayControls = ReactArrayControls<AbstractRolsterArrayControl>;

class RolsterArrayControl<
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
  public readonly error?: ValidatorError<T> | undefined;
  public readonly state?: FormState<T>;
  public readonly validators?: ValidatorFn<T>[] | undefined;

  parentGroup?: AbstractRolsterArrayGroup<C> | undefined;
  elementRef?: LegacyRef<E> | undefined;

  constructor(props: AbtractFormArrayControlProps<T>) {
    const { uuid, focused, dirty, disabled, state, touched, validators } =
      props;

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

  public reset(): void {}

  private update(changes: Partial<AbtractFormArrayControlProps<T>>): void {
    this.parentGroup?.parentArray?.update(this, changes);
  }
}

interface AbstractRolsterArrayGroup<
  T extends RolsterArrayControls = RolsterArrayControls,
  R = any
> extends ReactArrayGroup<T, R> {
  parentArray?: RolsterFormArray<T>;
  validators?: ValidatorGroupFn<T>[];
}

class RolsterArrayGroup<
  T extends RolsterArrayControls = RolsterArrayControls,
  R = any
> implements AbstractRolsterArrayGroup<T, R>
{
  public readonly uuid: string;
  public readonly resource?: R;
  public readonly controls: T;
  public readonly dirty: boolean;
  public readonly dirties: boolean;
  public readonly errors: ValidatorError<any>[];
  public readonly invalid: boolean;
  public readonly pristine: boolean;
  public readonly pristines: boolean;
  public readonly touched: boolean;
  public readonly toucheds: boolean;
  public readonly untouched: boolean;
  public readonly untoucheds: boolean;
  public readonly valid: boolean;
  public readonly wrong: boolean;
  public readonly error?: ValidatorError<any> | undefined;
  public readonly validators?: ValidatorGroupFn<T>[] | undefined;

  public readonly state: ArrayStateGroup<T>;
  public readonly value: ArrayValueGroup<T>;

  parentArray?: RolsterFormArray<T> | undefined;

  constructor(props: FormArrayGroupProps<T>) {
    const { controls, resource, uuid, validators } = props;

    Object.values(controls).forEach((control) => {
      control.parentGroup = this;
    });

    this.uuid = uuid;
    this.controls = controls;
    this.validators = validators;
    this.resource = resource;

    this.errors = validators ? groupIsValid({ controls, validators }) : [];

    this.error = this.errors[0];
    this.valid =
      this.errors.length === 0 && controlsAllChecked(controls, 'valid');
    this.invalid = !this.valid;

    this.touched = controlsPartialChecked(controls, 'touched');
    this.untouched = !this.touched;
    this.toucheds = controlsAllChecked(controls, 'touched');
    this.untoucheds = !this.toucheds;
    this.dirty = controlsPartialChecked(controls, 'dirty');
    this.pristine = !this.dirty;
    this.dirties = controlsAllChecked(controls, 'dirty');
    this.pristines = !this.dirties;
    this.wrong = this.touched && this.invalid;

    this.state = controlsToState(controls);
    this.value = controlsToValue(controls);
  }
}

interface RolsterFormArray<T extends ReactArrayControls>
  extends ReactFormArray<T> {
  update(
    control: AbstractRolsterArrayControl<any, T>,
    changes: Partial<AbtractFormArrayControlProps<any>>
  ): void;
}

interface RolsterControlProps<T = any> extends FormArrayControlProps<T> {
  touched?: boolean;
}

type ReactControlProps<T = any> = Omit<RolsterControlProps<T>, 'uuid'>;

export function useFormArrayControl<
  T = any,
  C extends ReactArrayControls = any,
  E extends HTMLElement = HTMLElement
>(props: ReactControlProps<T>): AbstractRolsterArrayControl<T, C, E> {
  return new RolsterArrayControl({ ...props, uuid: uuid() });
}

export function useInputArrayControl<
  T = any,
  C extends ReactArrayControls = any
>(
  props: ReactControlProps<T>
): AbstractRolsterArrayControl<T, C, HTMLInputElement> {
  return new RolsterArrayControl({ ...props, uuid: uuid() });
}

type RolsterGroupProps<
  T extends RolsterArrayControls = RolsterArrayControls,
  R = any
> = Omit<FormArrayGroupProps<T, R>, 'uuid'>;

export function useFormArrayGroup<
  T extends RolsterArrayControls = RolsterArrayControls,
  R = any
>(props: RolsterGroupProps<T>): AbstractRolsterArrayGroup<T, R> {
  return new RolsterArrayGroup({ ...props, uuid: uuid() });
}

function cloneFormArrayGroup<
  T = any,
  C extends ReactArrayControls = ReactArrayControls
>(
  group: AbstractRolsterArrayGroup<C>,
  control: AbstractRolsterArrayControl<T>,
  changes: Partial<AbtractFormArrayControlProps<T>>
): AbstractRolsterArrayGroup<C> {
  const newControl = new RolsterArrayControl({ ...control, ...changes });

  const controls = Object.entries(group.controls).reduce(
    (json: any, [key, currentControl]) => {
      json[key] =
        currentControl.uuid === newControl.uuid ? newControl : currentControl;

      return json;
    },
    {}
  );

  return new RolsterArrayGroup({ ...group, controls });
}

type RolsterArrayProps<
  T extends ReactArrayControls = ReactArrayControls,
  R = any
> = FormArrayProps<T, R, AbstractRolsterArrayGroup<T, R>>;

export function useFormArray<T extends ReactArrayControls, R = any>(
  props: RolsterArrayProps<T, R>
): ReactFormArray<T, R> {
  const [currentState] = useState(props.groups);
  const [state, setState] = useState<ArrayStateGroup<T>[]>([]);
  const [validators, setValidators] = useState(props.validators);
  const [controls, setControls] = useState<T[]>([]);
  const [groups, setGroups] = useState(props.groups || []);

  useEffect(() => {
    setControls(groups.map(({ controls }) => controls));
    setState(groups.map(({ controls }) => controlsToState(controls)));
  }, [groups]);

  const errors = validators ? arrayIsValid({ groups, validators }) : [];

  const error = errors[0];
  const valid = errors.length === 0 && groupAllChecked(groups, 'valid');

  const touched = groupPartialChecked(groups, 'touched');
  const toucheds = groupAllChecked(groups, 'touched');
  const dirties = groupAllChecked(groups, 'dirty');
  const dirty = groupPartialChecked(groups, 'dirty');

  function push(group: AbstractRolsterArrayGroup<T, R>): void {
    setGroups([...groups, group]);
  }

  function merge(newGroups: AbstractRolsterArrayGroup<T, R>[]): void {
    setGroups([...groups, ...newGroups]);
  }

  function set(groups: AbstractRolsterArrayGroup<T, R>[]): void {
    setGroups(groups);
  }

  function update(
    control: AbstractRolsterArrayControl<T>,
    changes: Partial<AbtractFormArrayControlProps<T>>
  ): void {
    if (control.parentGroup) {
      const group = cloneFormArrayGroup(control.parentGroup, control, changes);

      setGroups(
        groups.map((currentGroup) =>
          currentGroup.uuid === group.uuid ? group : currentGroup
        )
      );
    }
  }

  function remove(group: ReactArrayGroup<T>): void {
    setGroups(groups.filter(({ uuid }) => group.uuid !== uuid));
  }

  function reset(): void {
    setGroups(currentState || []);
  }

  const formArray: RolsterFormArray<T> = {
    controls,
    dirty,
    dirties,
    error,
    errors,
    groups,
    invalid: !valid,
    merge,
    pristine: !dirty,
    pristines: !dirties,
    push,
    remove,
    reset,
    set,
    setValidators,
    state,
    touched,
    toucheds,
    untouched: !touched,
    untoucheds: !toucheds,
    update,
    valid,
    value: state as ArrayValueGroup<T>[],
    wrong: touched && !valid
  };

  groups.forEach((group) => (group.parentArray = formArray));

  return formArray;
}
