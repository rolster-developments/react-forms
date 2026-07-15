import { AbstractArray } from '@rolster/forms';
import { RefObject } from 'react';
import { ReactArrayControls, ReactArrayGroup } from './form-array-group.type';

export interface ReactFormArray<
  C extends ReactArrayControls = ReactArrayControls,
  R = any,
  G extends ReactArrayGroup<C, R> = ReactArrayGroup<C, R>
> extends AbstractArray<C, R, G> {
  elementRef?: RefObject<HTMLElement>;
}
