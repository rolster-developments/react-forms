import { AbstractControl } from '@rolster/forms';
import { RefObject } from 'react';

export interface ReactAbstractControl<
  E extends HTMLElement = HTMLElement,
  T = any
> extends AbstractControl<T> {
  elementRef?: RefObject<E>;
}
