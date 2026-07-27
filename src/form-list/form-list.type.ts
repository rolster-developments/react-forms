import { ReactFormControl } from '../form-control/form-control.type';

export interface ReactFormList<
  E extends HTMLElement = HTMLElement,
  T = any
> extends ReactFormControl<E, T[]> {
  clear: () => void;
  push: (item: T) => void;
  remove: (item: T) => void;
}

export type ReactHtmlList<T = any> = ReactFormList<HTMLElement, T>;
