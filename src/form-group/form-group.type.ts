import { AbstractControls, AbstractFormGroup } from '@rolster/forms';
import { ReactFormControl } from '../form-control/form-control.type';

export type ReactControls<T extends ReactFormControl = ReactFormControl> =
  AbstractControls<T>;

export type ReactGroup<C extends ReactControls = ReactControls> =
  AbstractFormGroup<C>;
