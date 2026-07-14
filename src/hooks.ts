import { useMemo, useState } from 'react';

import { ReactFormArray } from './form-array/form-array.type';
import {
  ReactArrayControls,
  ReactArrayGroup
} from './form-array/form-array-group.type';

interface FormArrayGroupSelectProps<
  C extends ReactArrayControls = ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
> {
  formArray: ReactFormArray<C, R, G>;
}

interface FormArrayGroupSelect<
  C extends ReactArrayControls = ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
> {
  setFormGroup: (formGroup?: G) => void;
  formGroup?: G;
}

export function useFormArrayGroupSelect<
  C extends ReactArrayControls = ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
>({
  formArray
}: FormArrayGroupSelectProps<C, R, G>): FormArrayGroupSelect<C, R, G> {
  const [formSelect, setFormGroup] = useState<G>();

  const formGroup = useMemo(() => {
    return (
      formSelect &&
      formArray.groups.find(({ uuid }) => formSelect.uuid === uuid)
    );
  }, [formArray.value, formSelect]);

  return { formGroup, setFormGroup };
}
