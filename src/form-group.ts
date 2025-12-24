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
import { useCallback, useEffect, useRef, useState } from 'react';
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

function refactorForValid<C extends ReactControls>(
  controls: C,
  validators?: ValidatorGroupFn<C>[]
) {
  const errors = validators ? groupIsValid({ controls, validators }) : [];

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
  const formGroup = createFormGroupOptions<C, FormGroupOptions<C>>(
    options,
    validators
  );

  const firstEffects = useRef({
    dirty: true,
    disabledFocused: true,
    touched: true,
    value: true
  });

  const [state, setState] = useState<GroupState<C>>({
    ...refactorForValid(formGroup.controls, formGroup.validators),
    controls: formGroup.controls,
    dirties: controlsAllChecked(formGroup.controls, 'dirty'),
    dirty: controlsPartialChecked(formGroup.controls, 'dirty'),
    touched: controlsPartialChecked(formGroup.controls, 'touched'),
    toucheds: controlsAllChecked(formGroup.controls, 'touched'),
    value: controlsToValue(formGroup.controls),
    validators: formGroup.validators
  });

  useEffect(
    () => {
      if (!firstEffects.current.value) {
        setState((state) => ({
          ...state,
          ...refactorForValid(formGroup.controls, state.validators),
          controls: formGroup.controls,
          value: controlsToValue(formGroup.controls)
        }));
      } else {
        firstEffects.current.value = false;
      }
    },
    reduceControlsToArray(formGroup.controls, 'value')
  );

  useEffect(() => {
    if (!firstEffects.current.disabledFocused) {
      setState((state) => ({
        ...state,
        controls: formGroup.controls
      }));
    } else {
      firstEffects.current.disabledFocused = false;
    }
  }, [
    ...reduceControlsToArray(formGroup.controls, 'disabled'),
    ...reduceControlsToArray(formGroup.controls, 'focused' as any)
  ]);

  useEffect(
    () => {
      if (!firstEffects.current.dirty) {
        setState((state) => ({
          ...state,
          controls: formGroup.controls,
          dirty: controlsPartialChecked(formGroup.controls, 'dirty'),
          dirties: controlsAllChecked(formGroup.controls, 'dirty')
        }));
      } else {
        firstEffects.current.dirty = false;
      }
    },
    reduceControlsToArray(formGroup.controls, 'dirty')
  );

  useEffect(
    () => {
      if (!firstEffects.current.touched) {
        setState((state) => ({
          ...state,
          controls: formGroup.controls,
          touched: controlsPartialChecked(formGroup.controls, 'touched'),
          toucheds: controlsAllChecked(formGroup.controls, 'touched')
        }));
      } else {
        firstEffects.current.touched = false;
      }
    },
    reduceControlsToArray(formGroup.controls, 'touched')
  );

  const setValidators = useCallback((validators?: ValidatorGroupFn<C>[]) => {
    setState((state) => ({
      ...state,
      ...refactorForValid(state.controls, validators)
    }));
  }, []);

  const reset = useCallback(() => {
    Object.values(formGroup.controls).forEach((control) => {
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
