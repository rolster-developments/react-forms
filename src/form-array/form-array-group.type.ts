import { AbstractArrayControls, AbstractArrayGroup } from '@rolster/forms';
import { ReactArrayAction, ReactArrayControl } from './form-array-control.type';

export type ReactArrayControls<
  T extends ReactArrayControl = ReactArrayControl
> = AbstractArrayControls<T>;

export interface ReactArrayGroup<
  C extends ReactArrayControls,
  R = any
> extends AbstractArrayGroup<C, R> {
  setResource(resource: Undefined<R>): void;
  subscribe: (subscriber: ReactArrayGroupSubscriber<C, R>) => void;
}

export type ReactArrayGroupSubscriber<C extends ReactArrayControls, R = any> = (
  action: ReactArrayAction,
  control: ReactArrayGroup<C, R>
) => void;
