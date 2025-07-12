import { useMemo, useState } from 'react';
import { ReactArrayControls, ReactArrayGroup, ReactFormArray } from './types';

interface ArrayFormGroupSelectProps<
  C extends ReactArrayControls = ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
> {
  formArray: ReactFormArray<C, R, G>;
}

interface ArrayFormGroupSelect<
  C extends ReactArrayControls = ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
> {
  setFormGroup: (formGroup?: G) => void;
  formGroup?: G;
}

export function useArrayFormGroupSelect<
  C extends ReactArrayControls = ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
>({
  formArray
}: ArrayFormGroupSelectProps<C, R, G>): ArrayFormGroupSelect<C, R, G> {
  const [formSelect, setFormGroup] = useState<G>();

  const formGroup = useMemo(() => {
    return (
      formSelect &&
      formArray.groups.find(({ uuid }) => formSelect.uuid === uuid)
    );
  }, [formArray.value, formSelect]);

  return { formGroup, setFormGroup };
}
