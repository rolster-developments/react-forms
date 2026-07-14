import {
  AbstractArrayList,
  ArrayControlsValue,
  ArrayListValueToControls
} from '@rolster/forms';

import {
  ReactArrayControl,
  ReactArrayControlOptions
} from './form-array-control.type';
import { ReactArrayControls } from './form-array-group.type';

export type ArrayListValueToUuid<
  C extends ReactArrayControls = ReactArrayControls
> = (value: ArrayControlsValue<C>) => string;

export interface ReactArrayListOptions<
  C extends ReactArrayControls = ReactArrayControls
> extends ReactArrayControlOptions<ArrayControlsValue<C>[]> {
  controls: C[];
  valueToControls: ArrayListValueToControls<C>;
  controlsUuid?: string[];
  valueToUuid?: ArrayListValueToUuid<C>;
}

export interface ReactArrayList<
  C extends ReactArrayControls = ReactArrayControls
>
  extends
    ReactArrayControl<HTMLElement, ArrayControlsValue<C>[]>,
    AbstractArrayList<C> {
  controlsUuid: string[];
  findControlsByUuid(uuid: string): Undefined<C>;
}
