import {
  ControlsValue,
  FormGroupOptions,
  ValidatorGroupFn
} from '@rolster/forms';
import { createFormGroupOptions } from '@rolster/forms/arguments';
import {
  controlsAllChecked,
  controlsPartialChecked,
  controlsToValue,
  groupIsValid,
  reduceControlsToArray
} from '@rolster/forms/helpers';
import { ValidatorError } from '@rolster/validators';
import { useCallback, useEffect, useState } from 'react';
import { ReactControls, ReactGroup } from './types';

interface GroupState<C extends ReactControls> {
  controls: C;
  dirties: boolean;
  dirty: boolean;
  errors: ValidatorError[];
  touched: boolean;
  toucheds: boolean;
  valid: boolean;
  value: ControlsValue<C>;
  validators?: ValidatorGroupFn<C>[];
}

function errorsInGroup<C extends ReactControls>(
  controls: C,
  validators?: ValidatorGroupFn<C>[]
): ValidatorError<any>[] {
  return validators ? groupIsValid({ controls, validators }) : [];
}

function validStateInGroup<C extends ReactControls>(
  controls: C,
  validators?: ValidatorGroupFn<C>[]
) {
  const errors = errorsInGroup(controls, validators);

  return {
    errors,
    valid: errors.length === 0 && controlsAllChecked(controls, 'valid')
  };
}

export function useFormGroup<C extends ReactControls>(
  options: FormGroupOptions<C>
): ReactGroup<C>;
export function useFormGroup<C extends ReactControls>(
  controls: C,
  validators?: ValidatorGroupFn<C>[]
): ReactGroup<C>;
export function useFormGroup<C extends ReactControls>(
  options: FormGroupOptions<C> | C,
  validators?: ValidatorGroupFn<C>[]
): ReactGroup<C> {
  const _options = createFormGroupOptions<C, FormGroupOptions<C>>(
    options,
    validators
  );

  const { controls } = _options;

  const [state, setState] = useState<GroupState<C>>({
    ...validStateInGroup(controls, _options.validators),
    controls,
    dirties: controlsAllChecked(controls, 'dirty'),
    dirty: controlsPartialChecked(controls, 'dirty'),
    touched: controlsPartialChecked(controls, 'touched'),
    toucheds: controlsAllChecked(controls, 'touched'),
    value: controlsToValue(controls),
    validators: _options.validators
  });

  useEffect(
    () => {
      setState((state) => ({
        ...state,
        ...validStateInGroup(controls, state.validators),
        controls,
        value: controlsToValue(controls)
      }));
    },
    reduceControlsToArray(controls, 'value')
  );

  useEffect(() => {
    setState((state) => ({
      ...state,
      controls
    }));
  }, [
    ...reduceControlsToArray(controls, 'disabled'),
    ...reduceControlsToArray(controls, 'focused' as any)
  ]);

  useEffect(
    () => {
      setState((state) => ({
        ...state,
        controls,
        dirty: controlsPartialChecked(controls, 'dirty'),
        dirties: controlsAllChecked(controls, 'dirty')
      }));
    },
    reduceControlsToArray(controls, 'dirty')
  );

  useEffect(
    () => {
      setState((state) => ({
        ...state,
        controls,
        touched: controlsPartialChecked(controls, 'touched'),
        toucheds: controlsAllChecked(controls, 'touched')
      }));
    },
    reduceControlsToArray(controls, 'touched')
  );

  const setValidators = useCallback((validators?: ValidatorGroupFn<C>[]) => {
    setState((state) => ({
      ...state,
      ...validStateInGroup(state.controls, validators)
    }));
  }, []);

  const reset = useCallback(() => {
    Object.values(controls).forEach((control) => {
      control.reset();
    });
  }, []);

  return {
    ...state,
    error: state.errors[0],
    invalid: !state.valid,
    pristine: !state.dirty,
    pristines: !state.dirties,
    reset,
    setValidators,
    untouched: !state.touched,
    untoucheds: !state.toucheds,
    wrong: state.touched && !state.valid
  };
}
