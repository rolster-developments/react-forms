import {
  ArrayStateGroup,
  ArrayValueGroup,
  FormArrayGroupProps,
  FormArrayProps,
  ValidatorArrayFn,
  createFormArrayProps
} from '@rolster/helpers-forms';
import {
  arrayIsValid,
  controlsToState,
  groupAllChecked,
  groupPartialChecked
} from '@rolster/helpers-forms/helpers';
import { useEffect, useState } from 'react';
import {
  ReactArrayControl,
  ReactArrayControls,
  ReactArrayGroup,
  ReactFormArray
} from '../types';
import { RolsterArrayControl } from './form-array-control.hook';
import { RolsterArrayGroup } from './form-array-group.hook';
import {
  AbstractRolsterArrayControl,
  AbstractRolsterArrayGroup,
  AbtractFormArrayControlProps,
  RolsterFormArray
} from './types';

export function cloneFormArrayControl<
  T = any,
  C extends ReactArrayControls = ReactArrayControls,
  E extends HTMLElement = HTMLElement
>(
  control: AbstractRolsterArrayControl<T, C, E>,
  changes: Partial<AbtractFormArrayControlProps<T>>
): ReactArrayControl<E, T> {
  return new RolsterArrayControl({ ...control, ...changes });
}

export function cloneFormArrayGroup<C extends ReactArrayControls = ReactArrayControls>(
  group: AbstractRolsterArrayGroup<C>,
  changes: Partial<FormArrayGroupProps<C>>
): ReactArrayGroup<C> {
  return new RolsterArrayGroup({ ...group, ...changes });
}

export function cloneFormControlForArrayGroup<
  T = any,
  C extends ReactArrayControls = ReactArrayControls
>(
  group: AbstractRolsterArrayGroup<C>,
  control: AbstractRolsterArrayControl<T>,
  changes: Partial<AbtractFormArrayControlProps<T>>
): AbstractRolsterArrayGroup<C> {
  const newControl = cloneFormArrayControl(control, changes);

  const { uuid } = newControl;

  const controls = Object.entries(group.controls).reduce(
    (controls: any, [key, control]) => {
      controls[key] = control.uuid === uuid ? newControl : control;

      return controls;
    },
    {}
  );

  return new RolsterArrayGroup({ ...group, controls });
}

type RolsterArrayProps<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
> = FormArrayProps<C, R, AbstractRolsterArrayGroup<C, R>>;

export function useFormArray<
  G extends ReactArrayControls,
  R = any
>(): ReactFormArray<G, R>;
export function useFormArray<G extends ReactArrayControls, R = any>(
  props: RolsterArrayProps<G>
): ReactFormArray<G, R>;
export function useFormArray<G extends ReactArrayControls, R = any>(
  groups: AbstractRolsterArrayGroup<G, R>[],
  validators?: ValidatorArrayFn<G, R>[]
): ReactFormArray<G, R>;
export function useFormArray<G extends ReactArrayControls, R = any>(
  arrayProps?: RolsterArrayProps<G> | AbstractRolsterArrayGroup<G, R>[],
  arrayValidators?: ValidatorArrayFn<G, R>[]
): ReactFormArray<G, R> {
  const props = createFormArrayProps<G, R, any, RolsterArrayProps<G, R>>(
    arrayProps,
    arrayValidators
  );

  const [currentState] = useState(props.groups);
  const [state, setState] = useState<ArrayStateGroup<G>[]>([]);
  const [validators, setValidators] = useState(props.validators);
  const [controls, setControls] = useState<G[]>([]);
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

  function push(group: AbstractRolsterArrayGroup<G, R>): void {
    setGroups([...groups, group]);
  }

  function merge(newGroups: AbstractRolsterArrayGroup<G, R>[]): void {
    setGroups([...groups, ...newGroups]);
  }

  function set(groups: AbstractRolsterArrayGroup<G, R>[]): void {
    setGroups(groups);
  }

  function refreshControl(
    control: AbstractRolsterArrayControl<G>,
    changes: Partial<AbtractFormArrayControlProps<G>>
  ): void {
    if (control.group) {
      const group = cloneFormControlForArrayGroup(
        control.group,
        control,
        changes
      );

      setGroups(
        groups.map((currentGroup) =>
          currentGroup.uuid === group.uuid ? group : currentGroup
        )
      );
    }
  }

  function refreshGroup(
    group: AbstractRolsterArrayGroup<G>,
    changes: Partial<FormArrayGroupProps<G>>
  ): void {
    const newGroup = cloneFormArrayGroup(group, changes);

    const { uuid } = newGroup;

    setGroups(
      groups.map((currentGroup) =>
        currentGroup.uuid === uuid ? newGroup : currentGroup
      )
    );
  }

  function remove(group: ReactArrayGroup<G>): void {
    setGroups(groups.filter(({ uuid }) => group.uuid !== uuid));
  }

  function reset(): void {
    setGroups(currentState || []);
  }

  const formArray: RolsterFormArray<G> = {
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
    refreshControl,
    refreshGroup,
    remove,
    reset,
    set,
    setValidators,
    state,
    touched,
    toucheds,
    untouched: !touched,
    untoucheds: !toucheds,
    valid,
    value: state as ArrayValueGroup<G>[],
    wrong: touched && !valid
  };

  groups.forEach((group) => (group.parent = formArray));

  return formArray;
}
