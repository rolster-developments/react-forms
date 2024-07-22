import {
  FormGroupOptions,
  ValidatorGroupFn,
  createFormGroupOptions
} from '@rolster/forms';
import {
  controlsAllChecked,
  controlsPartialChecked,
  controlsToState,
  groupIsValid
} from '@rolster/forms/helpers';
import { useState } from 'react';
import { ReactControls, ReactFormGroup } from './types';

export function useFormGroup<C extends ReactControls>(
  options: FormGroupOptions<C>
): ReactFormGroup<C>;
export function useFormGroup<C extends ReactControls>(
  controls: C,
  validators?: ValidatorGroupFn<C>[]
): ReactFormGroup<C>;
export function useFormGroup<C extends ReactControls>(
  groupOptions: FormGroupOptions<C> | C,
  groupValidators?: ValidatorGroupFn<C>[]
): ReactFormGroup<C> {
  const props = createFormGroupOptions<C, FormGroupOptions<C>>(
    groupOptions,
    groupValidators
  );

  const [validators, setValidators] = useState(props.validators);

  const { controls } = props;

  const errors = validators ? groupIsValid({ controls, validators }) : [];
  const valid = errors.length === 0 && controlsAllChecked(controls, 'valid');
  const touched = controlsPartialChecked(controls, 'touched');
  const toucheds = controlsAllChecked(controls, 'touched');
  const dirty = controlsPartialChecked(controls, 'dirty');
  const dirties = controlsAllChecked(controls, 'dirty');
  const state = controlsToState(controls);

  function reset(): void {
    Object.values(controls).forEach((control) => {
      control.reset();
    });
  }

  return {
    controls,
    dirty,
    dirties,
    error: errors[0],
    errors,
    invalid: !valid,
    pristine: !dirty,
    pristines: !dirties,
    reset,
    state,
    setValidators,
    touched,
    toucheds,
    untouched: !touched,
    untoucheds: !toucheds,
    valid,
    wrong: touched && !valid
  };
}
