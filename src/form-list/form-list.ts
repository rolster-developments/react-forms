import { ValidatorFn } from '@rolster/validators';
import { useCallback } from 'react';
import { useReactControl } from '../form-control/form-control';
import { ReactFormList, ReactHtmlList } from './form-list.type';

export function useReactList<E extends HTMLElement, T = any>(
  value?: T[],
  validators?: ValidatorFn<T[]>[]
): ReactFormList<E, T> {
  const control = useReactControl<E, T[]>(value || [], validators);

  const push = useCallback(
    (item: T) => {
      control.setValue([...control.value, item]);
    },
    [control.value, control.setValue]
  );

  const remove = useCallback(
    (item: T) => {
      const value = control.value.filter((current) => current !== item);

      if (value.length !== control.value.length) {
        control.setValue(value);
      }
    },
    [control.value, control.setValue]
  );

  const clear = useCallback(() => {
    if (control.value.length > 0) {
      control.setValue([]);
    }
  }, [control.value, control.setValue]);

  return {
    ...control,
    clear,
    push,
    remove
  };
}

export function useFormList<T = any>(
  value?: T[],
  validators?: ValidatorFn<T[]>[]
): ReactHtmlList<T> {
  return useReactList<HTMLElement, T>(value, validators);
}
