import { FormGroupOptions, ValidatorGroupFn } from '@rolster/forms';
import { createFormGroupOptions } from '@rolster/forms/arguments';
import {
  controlsAllChecked,
  controlsPartialChecked,
  controlsToValue,
  groupIsValid
} from '@rolster/forms/helpers';
import { useState } from 'react';
import { ReactControls, ReactGroup } from './types';

export function useFormGroup<C extends ReactControls>(
  options: FormGroupOptions<C>
): ReactGroup<C>;
export function useFormGroup<C extends ReactControls>(
  controls: C,
  validators?: ValidatorGroupFn<C>[]
): ReactGroup<C>;
export function useFormGroup<C extends ReactControls>(
  options: FormGroupOptions<C> | C,
  groupValidators?: ValidatorGroupFn<C>[]
): ReactGroup<C> {
  const groupOptions = createFormGroupOptions<C, FormGroupOptions<C>>(
    options,
    groupValidators
  );

  const [validators, setValidators] = useState(groupOptions.validators);

  const { controls } = groupOptions;

  const errors = validators ? groupIsValid({ controls, validators }) : [];
  const valid = errors.length === 0 && controlsAllChecked(controls, 'valid');
  const value = controlsToValue(controls);
  const dirty = controlsPartialChecked(controls, 'dirty');
  const dirtyAll = controlsAllChecked(controls, 'dirty');
  const touched = controlsPartialChecked(controls, 'touched');
  const touchedAll = controlsAllChecked(controls, 'touched');

  function reset(): void {
    Object.values(controls).forEach((control) => {
      control.reset();
    });
  }

  return {
    controls,
    dirty,
    dirtyAll,
    error: errors[0],
    errors,
    invalid: !valid,
    pristine: !dirty,
    pristineAll: !dirtyAll,
    reset,
    setValidators,
    touched,
    touchedAll,
    untouched: !touched,
    untouchedAll: !touchedAll,
    valid,
    value,
    wrong: touched && !valid
  };
}
