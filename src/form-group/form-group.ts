import {
  ControlsValue,
  FormGroupOptions,
  ValidatorGroupFn
} from '@rolster/forms';
import {
  controlsToValue,
  createFormGroupOptions,
  formGroupIsValid,
  verifyAllTrueInControls,
  verifyAnyTrueInControls
} from '@rolster/forms/helpers';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ReactControls, ReactGroup } from './form-group.type';

function refactorForValid<C extends ReactControls>(
  controls: C,
  validators?: ValidatorGroupFn<C>[]
) {
  const errors = validators ? formGroupIsValid({ controls, validators }) : [];

  return {
    errors,
    valid: errors.length === 0 && verifyAllTrueInControls(controls, 'valid')
  };
}

function controlsShallowEqual(a: ReactControls, b: ReactControls): boolean {
  if (a === b) {
    return true;
  }

  const keys = Object.keys(a);

  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => a[key] === b[key])
  );
}

function useStableControls<C extends ReactControls>(controls: C): C {
  const controlsRef = useRef(controls);

  if (!controlsShallowEqual(controlsRef.current, controls)) {
    controlsRef.current = controls;
  }

  return controlsRef.current;
}

interface GroupSnapshot {
  valids: boolean[];
  values: any[];
}

function arraysShallowEqual(a: readonly any[], b: readonly any[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function snapshotInControls(controls: ReactControls): GroupSnapshot {
  const valids: boolean[] = [];
  const values: any[] = [];

  Object.values(controls).forEach((control) => {
    valids.push(control.valid);
    values.push(control.value);
  });

  return { valids, values };
}

function useValidationSnapshot(controls: ReactControls): GroupSnapshot {
  const snapshot = snapshotInControls(controls);
  const snapshotRef = useRef(snapshot);

  if (
    !arraysShallowEqual(snapshotRef.current.values, snapshot.values) ||
    !arraysShallowEqual(snapshotRef.current.valids, snapshot.valids)
  ) {
    snapshotRef.current = snapshot;
  }

  return snapshotRef.current;
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

  const controls = useStableControls(formGroup.controls);

  const refControls = useRef(controls);
  refControls.current = controls;

  const [groupValidators, setGroupValidators] = useState(
    () => formGroup.validators
  );

  const snapshot = useValidationSnapshot(controls);

  const value = useMemo(
    () => controlsToValue<C>(refControls.current),
    [snapshot]
  );

  const validation = useMemo(
    () => refactorForValid(refControls.current, groupValidators),
    [groupValidators, snapshot]
  );

  const setValidators = useCallback((validators?: ValidatorGroupFn<C>[]) => {
    setGroupValidators(validators);
  }, []);

  const setValue = useCallback((value: Partial<ControlsValue<C>>) => {
    Object.entries(value).forEach(([key, valueControl]) => {
      const formControl = refControls.current[key as keyof C];

      formControl?.setValue(valueControl);
    });
  }, []);

  const reset = useCallback(() => {
    Object.values(refControls.current).forEach((control) => {
      control.reset();
    });
  }, []);

  return useMemo(() => {
    const { errors, valid } = validation;

    const dirty = verifyAnyTrueInControls(controls, 'dirty');
    const dirties = verifyAllTrueInControls(controls, 'dirty');
    const touched = verifyAnyTrueInControls(controls, 'touched');
    const toucheds = verifyAllTrueInControls(controls, 'touched');

    return {
      controls,
      dirties,
      dirty,
      error: errors[0],
      errors,
      invalid: !valid,
      pristine: !dirty,
      pristines: !dirties,
      reset,
      setValidators,
      setValue,
      touched,
      toucheds,
      untouched: !touched,
      untoucheds: !toucheds,
      valid,
      validators: groupValidators,
      value,
      wrong: touched && !valid
    };
  }, [
    controls,
    groupValidators,
    reset,
    setValidators,
    setValue,
    validation,
    value
  ]);
}
