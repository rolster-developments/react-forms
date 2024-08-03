import {
  ArrayStateGroup,
  FormArrayOptions,
  ValidatorArrayFn
} from '@rolster/forms';
import { createFormArrayOptions } from '@rolster/forms/arguments';
import {
  arrayIsValid,
  controlsToState,
  groupAllChecked,
  groupPartialChecked
} from '@rolster/forms/helpers';
import { useEffect, useRef, useState } from 'react';
import {
  ReactArrayControls,
  ReactArrayGroup,
  ReactFormArray,
  ReactSubscriberGroup
} from '../types';
import { RolsterArrayGroup } from './form-array-group.hook';

interface ArrayState<
  C extends ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
> {
  controls: C[];
  disabled: boolean;
  groups: G[];
  state: ArrayStateGroup<C>[];
  validators?: ValidatorArrayFn<C, R>[];
}

export function useFormArray<
  C extends ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
>(): ReactFormArray<C, R, G>;
export function useFormArray<
  C extends ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
>(options: FormArrayOptions<C, R, G>): ReactFormArray<C, R, G>;
export function useFormArray<
  C extends ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
>(
  groups: ReactArrayGroup<C, R>[],
  validators?: ValidatorArrayFn<C, R>[]
): ReactFormArray<C, R, G>;
export function useFormArray<
  C extends ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
>(
  options?: FormArrayOptions<C, R, G> | ReactArrayGroup<C, R>[],
  arrayValidators?: ValidatorArrayFn<C, R>[]
): ReactFormArray<C, R, G> {
  const arrayOptions = createFormArrayOptions<
    C,
    R,
    G,
    FormArrayOptions<C, R, G>
  >(options, arrayValidators);

  const { validators } = arrayOptions;
  const groups = arrayOptions.groups || [];

  const [arrayState, setArrayState] = useState<ArrayState<C, R, G>>({
    controls: groups.map(({ controls }) => controls),
    disabled: false,
    groups,
    state: groups.map(({ controls }) => controlsToState(controls)),
    validators
  });

  const currentState = useRef(groups);

  useEffect(() => {
    const subscriber: ReactSubscriberGroup<C, R> = (options) => {
      setArrayState((state) => ({
        ...state,
        groups: arrayState.groups.map((group) =>
          group.uuid === options.uuid
            ? new RolsterArrayGroup<C, R>(options)
            : group
        ) as G[]
      }));
    };

    arrayState.groups.forEach((group) => {
      group.subscribe(subscriber);
    });
  }, [arrayState]);

  const errors = validators ? arrayIsValid({ groups, validators }) : [];
  const error = errors[0];
  const valid = errors.length === 0 && groupAllChecked(groups, 'valid');

  const dirty = groupPartialChecked(groups, 'dirty');
  const dirtyAll = groupAllChecked(groups, 'dirty');
  const touched = groupPartialChecked(groups, 'touched');
  const touchedAll = groupAllChecked(groups, 'touched');

  function disable(): void {
    setArrayState((state) => ({ ...state, disabled: true }));
  }

  function enable(): void {
    setArrayState((state) => ({ ...state, disabled: false }));
  }

  function setGroups(groups: G[]): void {
    setArrayState((currentState) => ({
      ...currentState,
      groups,
      controls: groups.map(({ controls }) => controls),
      state: groups.map(({ controls }) => controlsToState(controls))
    }));
  }

  function push(group: G): void {
    setGroups([...arrayState.groups, group]);
  }

  function merge(groups: G[]): void {
    setGroups([...arrayState.groups, ...groups]);
  }

  function set(groups: G[]): void {
    setGroups(groups);
  }

  function remove({ uuid }: G): void {
    setGroups(arrayState.groups.filter((group) => group.uuid !== uuid));
  }

  function reset(): void {
    setGroups(currentState.current);
  }

  function setValidators(validators?: ValidatorArrayFn<C, R>[]): void {
    setArrayState((state) => ({ ...state, validators }));
  }

  return {
    ...arrayState,
    dirty,
    dirtyAll,
    disable,
    enable,
    enabled: !arrayState.disabled,
    error,
    errors,
    invalid: !valid,
    merge,
    pristine: !dirty,
    pristineAll: !dirtyAll,
    push,
    remove,
    reset,
    set,
    setValidators,
    touched,
    touchedAll,
    untouched: !touched,
    untouchedAll: !touchedAll,
    valid,
    wrong: touched && !valid
  };
}
