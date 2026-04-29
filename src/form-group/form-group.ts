import {
  ControlsValue,
  FormGroupOptions,
  ValidatorGroupFn
} from '@rolster/forms';
import {
  controlsToValue,
  createFormGroupOptions,
  formGroupIsValid,
  verifyAllTrueInControls
} from '@rolster/forms/helpers';
import { ValidatorError } from '@rolster/validators';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactControls, ReactGroup } from './form-group.type';

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

interface GroupStatus {
  dirty: boolean[];
  touched: boolean[];
  value: any[];
  visual: boolean[];
}

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

function checkAllSuccess(status: boolean[]): boolean {
  return status.reduce((success, status) => success && status, true);
}

function checkPartialSuccess(status: boolean[]): boolean {
  return status.reduce((success, status) => success || status, false);
}

function arraysShallowEqual(a: readonly any[], b: readonly any[]): boolean {
  if (a === b) {
    return true;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
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

  const refControls = useRef(formGroup.controls);
  refControls.current = formGroup.controls;

  const formGroupStatus = useMemo<GroupStatus>(() => {
    const dirty: boolean[] = [];
    const touched: boolean[] = [];
    const value: any[] = [];
    const visual: boolean[] = [];

    Object.values(formGroup.controls).forEach((control) => {
      dirty.push(control.dirty);
      touched.push(control.touched);
      value.push(control.value);
      visual.push(control.disabled);
      visual.push((control as any).focused);
    });

    return {
      dirty,
      touched,
      value,
      visual
    };
  }, [formGroup.controls]);

  const [state, setState] = useState<GroupState<C>>(() => {
    return {
      ...refactorForValid(formGroup.controls, formGroup.validators),
      controls: formGroup.controls,
      dirties: checkAllSuccess(formGroupStatus.dirty),
      dirty: checkPartialSuccess(formGroupStatus.dirty),
      touched: checkPartialSuccess(formGroupStatus.touched),
      toucheds: checkAllSuccess(formGroupStatus.touched),
      validators: formGroup.validators,
      value: controlsToValue(formGroup.controls)
    };
  });

  const refPrevFormGroupStatus = useRef<GroupStatus | null>(null);

  useEffect(() => {
    const formGroupPrev = refPrevFormGroupStatus.current;

    refPrevFormGroupStatus.current = formGroupStatus;

    if (!formGroupPrev) {
      return;
    }

    const valueChanged = !arraysShallowEqual(
      formGroupPrev.value,
      formGroupStatus.value
    );

    const dirtyChanged = !arraysShallowEqual(
      formGroupPrev.dirty,
      formGroupStatus.dirty
    );

    const touchedChanged = !arraysShallowEqual(
      formGroupPrev.touched,
      formGroupStatus.touched
    );

    const visualChanged = !arraysShallowEqual(
      formGroupPrev.visual,
      formGroupStatus.visual
    );

    if (!valueChanged && !dirtyChanged && !touchedChanged && !visualChanged) {
      return;
    }

    setState((state) => {
      const next: GroupState<C> = { ...state, controls: formGroup.controls };

      if (valueChanged) {
        const validResult = refactorForValid(
          formGroup.controls,
          state.validators
        );

        next.errors = validResult.errors;
        next.valid = validResult.valid;
        next.value = controlsToValue(formGroup.controls);
      }

      if (dirtyChanged) {
        next.dirty = checkPartialSuccess(formGroupStatus.dirty);
        next.dirties = checkAllSuccess(formGroupStatus.dirty);
      }

      if (touchedChanged) {
        next.touched = checkPartialSuccess(formGroupStatus.touched);
        next.toucheds = checkAllSuccess(formGroupStatus.touched);
      }

      return next;
    });
  });

  const setValidators = useCallback((validators?: ValidatorGroupFn<C>[]) => {
    setState((state) => ({
      ...state,
      ...refactorForValid(refControls.current, validators),
      validators
    }));
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

  return {
    ...state,
    error: state.errors[0],
    invalid: !state.valid,
    pristine: !state.dirty,
    pristines: !state.dirties,
    reset,
    setValidators,
    setValue,
    untouched: !state.touched,
    untoucheds: !state.toucheds,
    wrong: state.touched && !state.valid
  };
}
