import {
  ArrayControlsValue,
  FormArrayOptions,
  ValidatorArrayFn
} from '@rolster/forms';
import {
  controlsToValue,
  createFormArrayOptions,
  formArrayIsValid,
  hasError,
  someErrors,
  verifyAllTrueInGroups
} from '@rolster/forms/helpers';
import { ValidatorError } from '@rolster/validators';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactArrayAction } from './form-array-control.type';
import { ReactArrayControls, ReactArrayGroup } from './form-array-group.type';
import { ReactFormArray } from './form-array.type';

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
  const errors = validators ? formArrayIsValid({ groups, validators }) : [];

  return {
    errors,
    valid: errors.length === 0 && verifyAllTrueInGroups(groups, 'valid')
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

  const refArrayValue = useRef(formArray.groups || []);
  const refArrayGroups = useRef<Map<string, G>>(new Map());

  const [state, setState] = useState<ReactArrayState<C, R, G>>(() => {
    return {
      ...refactorForValid(refArrayValue.current, formArray.validators),
      controls: refArrayValue.current.map(({ controls }) => controls),
      dirty: false,
      dirties: false,
      disabled: false,
      groups: refArrayValue.current,
      touched: false,
      toucheds: false,
      value: refArrayValue.current.map(({ controls }) =>
        controlsToValue(controls)
      ),
      validators: formArray.validators
    };
  });

  const subscriber = useCallback(
    (action: ReactArrayAction, group: ReactArrayGroup<C, R>) => {
      setState((state) => {
        const groups = state.groups.map((currentGroup) => {
          return currentGroup.uuid === group.uuid ? group : currentGroup;
        }) as G[];

        return {
          ...state,
          ...refactorForControls(action, state, groups)
        };
      });
    },
    []
  );

  useEffect(() => {
    const previousGroups = refArrayGroups.current;
    const currentGroups = new Map<string, G>();

    state.groups.forEach((group) => {
      currentGroups.set(group.uuid, group);

      if (previousGroups.get(group.uuid) !== group) {
        group.subscribe(subscriber);
      }
    });

    refArrayGroups.current = currentGroups;
  }, [state.groups]);

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

  const setStartValue = useCallback((groups: G[]) => {
    setState((state) => ({
      ...state,
      ...refactorForGroups(groups, state.validators)
    }));
  }, []);

  const setDefaultValue = useCallback((groups: G[]) => {
    setState((state) => ({
      ...state,
      ...refactorForGroups(groups, state.validators)
    }));

    refArrayValue.current = groups;
  }, []);

  const push = useCallback((group: G) => {
    refArrayGroups.current.set(group.uuid, group);
    group.subscribe(subscriber);

    setState((state) => ({
      ...state,
      ...refactorForGroups([...state.groups, group], state.validators)
    }));
  }, []);

  const merge = useCallback((groups: G[]) => {
    groups.forEach((group) => {
      group.subscribe(subscriber);
      refArrayGroups.current.set(group.uuid, group);
    });

    setState((state) => ({
      ...state,
      ...refactorForGroups([...state.groups, ...groups], state.validators)
    }));
  }, []);

  const remove = useCallback(({ uuid }: G) => {
    refArrayGroups.current.delete(uuid);

    setState((state) => ({
      ...state,
      ...refactorForGroups(
        state.groups.filter((group) => group.uuid !== uuid),
        state.validators
      )
    }));
  }, []);

  const findByUuid = useCallback((uuid: string) => {
    return refArrayGroups.current.get(uuid);
  }, []);

  const setValidators = useCallback((validators?: ValidatorArrayFn<C, R>[]) => {
    setState((state) => ({
      ...state,
      ...refactorForValid(state.groups, validators),
      validators
    }));
  }, []);

  const formArrayHasError = useCallback(
    (key: string) => {
      return hasError(state.errors, key);
    },
    [state.errors]
  );

  const formArraySomeErrors = useCallback(
    (keys: string[]) => {
      return someErrors(state.errors, keys);
    },
    [state.errors]
  );

  const reset = useCallback(() => {
    refArrayValue.current.forEach((group) => group.reset());

    refArrayGroups.current = new Map();

    setState((state) => ({
      ...state,
      ...refactorForGroups(refArrayValue.current, state.validators)
    }));
  }, []);

  return {
    ...state,
    disable,
    enable,
    enabled: !state.disabled,
    error: state.errors[0],
    findByUuid,
    hasError: formArrayHasError,
    invalid: !state.valid,
    merge,
    pristine: !state.dirty,
    pristines: !state.dirties,
    push,
    remove,
    reset,
    setDefaultValue,
    setStartValue,
    setValidators,
    setValue,
    someErrors: formArraySomeErrors,
    untouched: !state.touched,
    untoucheds: !state.toucheds,
    wrong: state.touched && !state.valid
  };
}
