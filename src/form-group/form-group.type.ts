import { AbstractControls, AbstractFormGroup } from '@rolster/forms';

import { ReactAbstractControl } from '../form-control/form-control.type';

export type ReactControls<
  T extends ReactAbstractControl = ReactAbstractControl
> = AbstractControls<T>;

export type ReactGroup<C extends ReactControls = ReactControls> =
  AbstractFormGroup<C>;
