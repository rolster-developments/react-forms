import { reduceControlsToArray } from '@rolster/forms/helpers';
import { ReactAbstractControl } from './definitions';
import { ReactControls, ReactGroup } from './types';

export function reduceControlsToValues<
  T extends ReactAbstractControl,
  C extends ReactControls<T>
>(controls: C): T['value'][] {
  return reduceControlsToArray(controls, 'value');
}

export function reduceGroupToValues<
  T extends ReactAbstractControl,
  C extends ReactControls<T>
>(group: ReactGroup<C>): T['value'][] {
  return reduceControlsToValues(group.controls);
}
