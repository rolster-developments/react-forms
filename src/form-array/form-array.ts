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
  hasError as rolsterHasError,
  someErrors as rolsterSomeErrors
} from '@rolster/forms/helpers';
import { ValidatorError } from '@rolster/validators';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactArrayAction,
  ReactArrayControls,
  ReactArrayGroup,
  ReactFormArray
} from '../types';

interface ReactArrayState<
  C extends ReactArrayControls,
  R,
  G extends ReactArrayGroup<C, R>
> {
  controls: C[];
  dirties: boolean;
  dirty: boolean;
  disabled: boolean;
  errors: ValidatorError<any>[];
  groups: G[];
  touched: boolean;
  toucheds: boolean;
  valid: boolean;
  value: ArrayControlsValue<C>[];
  validators?: ValidatorArrayFn<C, R>[];
}

function refactorForValid<C extends ReactArrayControls, R>(
  groups: ReactArrayGroup<C, R>[],
  validators?: ValidatorArrayFn<C, R>[]
) {
  const errors = validators ? arrayIsValid({ groups, validators }) : [];

  return {
    errors,
    valid: errors.length === 0 && groupAllChecked(groups, 'valid')
  };
}

function refactorForGroups<
  C extends ReactArrayControls,
  R,
  G extends ReactArrayGroup<C, R>
>(groups: G[], validators?: ValidatorArrayFn<C, R>[]) {
  return {
    ...refactorForValid(groups, validators),
    groups,
    controls: groups.map(({ controls }) => controls),
    value: groups.map(({ controls }) => controlsToValue(controls))
  };
}

function refactorForControls<
  C extends ReactArrayControls,
  R,
  G extends ReactArrayGroup<C, R>
>(action: ReactArrayAction, state: ReactArrayState<C, R, G>, groups: G[]) {
  switch (action) {
    case 'validators':
      return refactorForValid(groups, state.validators);

    case 'reset':
    case 'list':
    case 'value':
      return refactorForGroups(groups, state.validators);

    default:
      return { groups };
  }
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
  const formArray = createFormArrayOptions<C, R, G, FormArrayOptions<C, R, G>>(
    options,
    validators
  );

  const groups = formArray.groups || [];
  const value = useRef(groups);
  const formGroups = useRef<Map<string, G>>(new Map());

  const [state, setState] = useState<ReactArrayState<C, R, G>>({
    ...refactorForValid(groups, formArray.validators),
    controls: groups.map(({ controls }) => controls),
    dirty: false,
    dirties: false,
    disabled: false,
    groups,
    touched: false,
    toucheds: false,
    value: groups.map(({ controls }) => controlsToValue(controls)),
    validators: formArray.validators
  });

  useEffect(() => {
    formGroups.current.clear();

    state.groups.forEach((group) => {
      formGroups.current.set(group.uuid, group);
      group.subscribe(subscriber);
    });
  }, [state.groups]);

  const subscriber = useCallback(
    (action: ReactArrayAction, group: ReactArrayGroup<C, R>) => {
      setState((state) => {
        const groups = state.groups.map((_group) => {
          return _group.uuid === group.uuid ? group : _group;
        }) as G[];

        return {
          ...state,
          ...refactorForControls(action, state, groups)
        };
      });
    },
    []
  );

  const disable = useCallback(() => {
    setState((state) => ({ ...state, disabled: true }));
  }, []);

  const enable = useCallback(() => {
    setState((state) => ({ ...state, disabled: false }));
  }, []);

  const setValue = useCallback((groups: G[]) => {
    setState((state) => ({
      ...state,
      ...refactorForGroups(groups, state.validators)
    }));
  }, []);

  const setInitialValue = useCallback((groups: G[]) => {
    setState((state) => ({
      ...state,
      ...refactorForGroups(groups, state.validators)
    }));

    value.current = groups;
  }, []);

  const push = useCallback((group: G) => {
    setState((state) => ({
      ...state,
      ...refactorForGroups([...state.groups, group], state.validators)
    }));
  }, []);

  const merge = useCallback((groups: G[]) => {
    setState((state) => ({
      ...state,
      ...refactorForGroups([...state.groups, ...groups], state.validators)
    }));
  }, []);

  const remove = useCallback(({ uuid }: G) => {
    setState((state) => ({
      ...state,
      ...refactorForGroups(
        state.groups.filter((group) => group.uuid !== uuid),
        state.validators
      )
    }));
  }, []);

  const findByUuid = useCallback(
    (uuid: string) => {
      return formGroups.current.get(uuid);
    },
    [state.groups]
  );

  const setValidators = useCallback((validators?: ValidatorArrayFn<C, R>[]) => {
    setState((state) => ({
      ...state,
      ...refactorForValid(state.groups, validators),
      validators
    }));
  }, []);

  const hasError = useCallback(
    (key: string) => rolsterHasError(state.errors, key),
    [state.errors]
  );

  const someErrors = useCallback(
    (keys: string[]) => rolsterSomeErrors(state.errors, keys),
    [state.errors]
  );

  const reset = useCallback(() => {
    setState((state) => ({
      ...state,
      ...refactorForGroups(value.current, state.validators)
    }));
  }, []);

  return {
    ...state,
    disable,
    enable,
    enabled: !state.disabled,
    error: state.errors[0],
    findByUuid,
    hasError,
    invalid: !state.valid,
    merge,
    pristine: !state.dirty,
    pristines: !state.dirties,
    push,
    remove,
    reset,
    setInitialValue,
    setValidators,
    setValue,
    someErrors,
    untouched: !state.touched,
    untoucheds: !state.toucheds,
    wrong: state.touched && !state.valid
  };
}
