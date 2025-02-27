import { reduceControlsToArray } from '@rolster/forms/helpers';
import { ReactControls, ReactFormControl, ReactGroup } from './types';

export function reduceControlsToValues<
  T extends ReactFormControl,
  C extends ReactControls<T>
>(controls: C): T['value'][] {
  return reduceControlsToArray(controls, 'value');
}

export function reduceGroupToArray<
  T extends ReactFormControl,
  C extends ReactControls<T>
>(group: ReactGroup<C>): T['value'][] {
  return reduceControlsToValues(group.controls);
}
