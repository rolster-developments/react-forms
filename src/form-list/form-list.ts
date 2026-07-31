import { ValidatorFn } from '@rolster/validators';
import { useCallback, useMemo } from 'react';
import { useReactControl } from '../form-control/form-control';
import { ReactFormList, ReactHtmlList } from './form-list.type';

export function useReactList<E extends HTMLElement, T = any>(
  value?: T[],
  validators?: ValidatorFn<T[]>[]
): ReactFormList<E, T> {
  const control = useReactControl<E, T[]>(value || [], validators);

  const push = useCallback(
    (item: T) => {
      control.setValue((current) => [...current, item]);
    },
    [control.setValue]
  );

  const remove = useCallback(
    (item: T) => {
      control.setValue((current) => {
        const value = current.filter((currentItem) => currentItem !== item);

        return value.length === current.length ? current : value;
      });
    },
    [control.setValue]
  );

  const clear = useCallback(() => {
    control.setValue((current) => (current.length > 0 ? [] : current));
  }, [control.setValue]);

  return useMemo(
    () => ({
      ...control,
      clear,
      push,
      remove
    }),
    [clear, control, push, remove]
  );
}

export function useFormList<T = any>(
  value?: T[],
  validators?: ValidatorFn<T[]>[]
): ReactHtmlList<T> {
  return useReactList<HTMLElement, T>(value, validators);
}
