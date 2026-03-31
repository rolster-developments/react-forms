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

export interface ReactArrayListOptions<
  C extends ReactArrayControls = ReactArrayControls
> extends ReactArrayControlOptions<ArrayControlsValue<C>[]> {
  controls: C[];
  valueToControls: ArrayListValueToControls<C>;
}

export interface ReactArrayList<
  C extends ReactArrayControls = ReactArrayControls
>
  extends
    ReactArrayControl<HTMLElement, ArrayControlsValue<C>[]>,
    AbstractArrayList<C> {}
