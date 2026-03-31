import { reduceControlsToArray } from '@rolster/forms/helpers';
import { ReactControls, ReactGroup } from './form-group/form-group.type';
import { ReactFormControl } from './form-control/form-control.type';

export function reduceControlsToValues<
  T extends ReactFormControl,
  C extends ReactControls<T>
>(controls: C): T['value'][] {
  return reduceControlsToArray(controls, 'value');
}

export function reduceGroupToValues<
  T extends ReactFormControl,
  C extends ReactControls<T>
>(group: ReactGroup<C>): T['value'][] {
  return reduceControlsToValues(group.controls);
}
