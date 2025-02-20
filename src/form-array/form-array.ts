import {
  ArrayControlsValue,
  FormArrayOptions,
  ValidatorArrayFn
} from '@rolster/forms';
import { createFormArrayOptions } from '@rolster/forms/arguments';
import {
  arrayIsValid,
  controlsToValue,
  groupAllChecked,
  groupPartialChecked,
  hasError as rolsterHasError,
  someErrors as rolsterSomeErrors
} from '@rolster/forms/helpers';
import { ValidatorError } from '@rolster/validators';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactArrayControls,
  ReactArrayGroup,
  ReactFormArray,
  ReactSubscriberGroup
} from '../types';
import { RolsterArrayGroup } from './form-array-group';

interface ArrayState<
  C extends ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
> {
  controls: C[];
  disabled: boolean;
  groups: G[];
  value: ArrayControlsValue<C>[];
  validators?: ValidatorArrayFn<C, R>[];
}

interface ArrayControlState {
  valid: boolean;
  dirty: boolean;
  dirtyAll: boolean;
  touched: boolean;
  touchedAll: boolean;
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
  validators?: ValidatorArrayFn<C, R>[]
): ReactFormArray<C, R, G> {
  const _options = createFormArrayOptions<C, R, G, FormArrayOptions<C, R, G>>(
    options,
    validators
  );

  const groups = _options.groups || [];
  const _value = useRef(groups);

  const [state, setState] = useState<ArrayState<C, R, G>>({
    controls: groups.map(({ controls }) => controls),
    disabled: false,
    groups,
    value: groups.map(({ controls }) => controlsToValue(controls)),
    validators: _options.validators
  });

  const [errors, setErrors] = useState<ValidatorError<any>[]>([]);

  const [controlState, setControlState] = useState<ArrayControlState>({
    valid: false,
    dirty: false,
    dirtyAll: false,
    touched: false,
    touchedAll: false
  });

  useEffect(() => {
    const subscriber: ReactSubscriberGroup<C, R> = (options) => {
      setValue(
        state.groups.map((group) =>
          group.uuid === options.uuid
            ? new RolsterArrayGroup<C, R>(options)
            : group
        ) as G[]
      );
    };

    state.groups.forEach((group) => {
      group.subscribe(subscriber);
    });

    setState((_state) => ({
      ..._state,
      controls: state.groups.map(({ controls }) => controls),
      value: state.groups.map(({ controls }) => controlsToValue(controls))
    }));
  }, [state.groups]);

  useEffect(() => {
    setErrors(
      state.validators
        ? arrayIsValid({
            groups: state.groups,
            validators: state.validators
          })
        : []
    );
  }, [state.groups, state.validators]);

  useEffect(() => {
    setControlState({
      valid: errors.length === 0 && groupAllChecked(state.groups, 'valid'),
      dirty: groupPartialChecked(state.groups, 'dirty'),
      dirtyAll: groupAllChecked(state.groups, 'dirty'),
      touched: groupPartialChecked(state.groups, 'touched'),
      touchedAll: groupAllChecked(state.groups, 'touched')
    });
  }, [state.groups, errors]);

  const disable = useCallback(() => {
    setState((state) => ({ ...state, disabled: true }));
  }, []);

  const enable = useCallback(() => {
    setState((state) => ({ ...state, disabled: false }));
  }, []);

  const setValue = useCallback((groups: G[]) => {
    setState((state) => ({ ...state, groups }));
  }, []);

  const setInitialValue = useCallback((groups: G[]) => {
    setState((state) => ({ ...state, groups }));
    _value.current = groups;
  }, []);

  const push = useCallback((group: G) => {
    setState((state) => ({ ...state, groups: [...state.groups, group] }));
  }, []);

  const merge = useCallback((groups: G[]) => {
    setState((state) => ({ ...state, groups: [...state.groups, ...groups] }));
  }, []);

  const remove = useCallback(({ uuid }: G) => {
    setState((state) => ({
      ...state,
      groups: state.groups.filter((group) => group.uuid !== uuid)
    }));
  }, []);

  const reset = useCallback(() => {
    setState((state) => ({ ...state, groups: _value.current }));
  }, []);

  const setValidators = useCallback((validators?: ValidatorArrayFn<C, R>[]) => {
    setState((state) => ({ ...state, validators }));
  }, []);

  const hasError = useCallback(
    (key: string) => rolsterHasError(errors, key),
    [errors]
  );

  const someErrors = useCallback(
    (keys: string[]) => rolsterSomeErrors(errors, keys),
    [errors]
  );

  return {
    ...state,
    ...controlState,
    disable,
    enable,
    enabled: !state.disabled,
    error: errors[0],
    errors: errors,
    hasError,
    invalid: !controlState.valid,
    merge,
    pristine: !controlState.dirty,
    pristineAll: !controlState.dirtyAll,
    push,
    remove,
    reset,
    setInitialValue,
    setValidators,
    setValue,
    someErrors,
    untouched: !controlState.touched,
    untouchedAll: !controlState.touchedAll,
    wrong: controlState.touched && !controlState.valid
  };
}
