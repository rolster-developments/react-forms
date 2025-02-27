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

function errorsInArray<C extends ReactArrayControls, R>(
  groups: ReactArrayGroup<C, R>[],
  validators?: ValidatorArrayFn<C, R>[]
): ValidatorError<any>[] {
  return validators ? arrayIsValid({ groups, validators }) : [];
}

function validStateInArray<C extends ReactArrayControls, R>(
  groups: ReactArrayGroup<C, R>[],
  validators?: ValidatorArrayFn<C, R>[]
) {
  const errors = errorsInArray(groups, validators);

  return {
    errors,
    valid: errors.length === 0 && groupAllChecked(groups, 'valid')
  };
}

function replaceStateInArray<
  C extends ReactArrayControls,
  R,
  G extends ReactArrayGroup<C, R>
>(groups: G[], validators?: ValidatorArrayFn<C, R>[]) {
  return {
    ...validStateInArray(groups, validators),
    groups,
    controls: groups.map(({ controls }) => controls),
    value: groups.map(({ controls }) => controlsToValue(controls))
  };
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
  const initialValue = useRef(groups);

  const [state, setState] = useState<ArrayState<C, R, G>>({
    ...validStateInArray(groups, _options.validators),
    controls: groups.map(({ controls }) => controls),
    dirty: false,
    dirties: false,
    disabled: false,
    groups,
    touched: false,
    toucheds: false,
    value: groups.map(({ controls }) => controlsToValue(controls)),
    validators: _options.validators
  });

  useEffect(() => {
    const subscriber: ReactSubscriberGroup<C, R> = (options) => {
      setState((state) => ({
        ...state,
        ...replaceStateInArray(
          state.groups.map((group) =>
            group.uuid === options.uuid
              ? new RolsterArrayGroup<C, R>(options)
              : group
          ) as G[],
          state.validators
        )
      }));
    };

    state.groups.forEach((group) => {
      group.subscribe(subscriber);
    });
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
      ...replaceStateInArray(groups, state.validators)
    }));
  }, []);

  const setInitialValue = useCallback((groups: G[]) => {
    setState((state) => ({
      ...state,
      ...replaceStateInArray(groups, state.validators)
    }));

    initialValue.current = groups;
  }, []);

  const push = useCallback((group: G) => {
    setState((state) => ({
      ...state,
      ...replaceStateInArray([...state.groups, group], state.validators)
    }));
  }, []);

  const merge = useCallback((groups: G[]) => {
    setState((state) => ({
      ...state,
      ...replaceStateInArray([...state.groups, ...groups], state.validators)
    }));
  }, []);

  const remove = useCallback(({ uuid }: G) => {
    setState((state) => ({
      ...state,
      ...replaceStateInArray(
        state.groups.filter((group) => group.uuid !== uuid),
        state.validators
      )
    }));
  }, []);

  const reset = useCallback(() => {
    setState((state) => ({
      ...state,
      ...replaceStateInArray(initialValue.current, state.validators)
    }));
  }, []);

  const setValidators = useCallback((validators?: ValidatorArrayFn<C, R>[]) => {
    setState((state) => ({
      ...state,
      ...validStateInArray(state.groups, validators),
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

  return {
    ...state,
    disable,
    enable,
    enabled: !state.disabled,
    error: state.errors[0],
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
