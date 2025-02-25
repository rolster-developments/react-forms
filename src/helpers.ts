import { ReactControls, ReactGroup } from './types';

type ControlsValue<C extends ReactControls = ReactControls> =
  C[keyof C]['value'][];

export function formGroupToArray<C extends ReactControls = ReactControls>({
  controls
}: ReactGroup<C>): ControlsValue<C>[] {
  return Object.values(controls).map(({ value }) => value);
}
