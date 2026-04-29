import { ReactArrayControl } from './form-array-control.type';
import { ReactArrayControls } from './form-array-group.type';

export function replaceControl<C extends ReactArrayControls>(
  controls: C,
  control: ReactArrayControl
): C {
  return Object.entries(controls).reduce(
    (controls, [key, _control]) => {
      if (_control.uuid === control.uuid) {
        (controls as any)[key as keyof C] = control;
      }

      return controls;
    },
    { ...controls }
  );
}
