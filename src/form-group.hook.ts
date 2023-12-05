import { FormGroupProps } from '@rolster/helpers-forms';
import {
  controlsAllChecked,
  controlsPartialChecked,
  controlsToState,
  controlsToValue,
  groupIsValid
} from '@rolster/helpers-forms/helpers';
import { useState } from 'react';
import { ReactControls, ReactGroup } from './types';

export function useFormGroup<T extends ReactControls>(
  props: FormGroupProps<T>
): ReactGroup<T> {
  const [validators, setValidators] = useState(props.validators);

  const { controls } = props;

  const errors = (() =>
    validators ? groupIsValid({ controls, validators }) : [])();

  const valid = (() =>
    errors.length === 0 && controlsAllChecked(controls, 'valid'))();

  const touched = (() => controlsPartialChecked(controls, 'touched'))();
  const toucheds = (() => controlsAllChecked(controls, 'touched'))();
  const dirty = (() => controlsPartialChecked(controls, 'dirty'))();
  const dirties = (() => controlsAllChecked(controls, 'dirty'))();

  const state = (() => controlsToState(controls))();
  const value = (() => controlsToValue(controls))();

  function reset(): void {
    Object.values(controls).forEach((control) => control.reset());
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
    value
  };
}
