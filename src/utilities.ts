import { ReactArrayControl, ReactArrayControls } from './types';

export function replaceControl<C extends ReactArrayControls>(
  controls: C,
  control: ReactArrayControl
): C {
  return Object.entries(controls).reduce((controls, [key, _control]) => {
    if (_control.uuid === control.uuid) {
      (controls as any)[key] = control;
    }

    return controls;
  }, controls);
}
