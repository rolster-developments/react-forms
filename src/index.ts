import { ReactArrayControl } from './form-array/form-array-control.type';
import { ReactFormControl } from './form-control/form-control.type';

export { useFormArray } from './form-array/form-array';
export * from './form-array/form-array.type';
export {
  areaArrayControl,
  formArrayControl,
  inputArrayControl,
  reactArrayControl
} from './form-array/form-array-control';
export * from './form-array/form-array-control.type';
export { formArrayGroup } from './form-array/form-array-group';
export * from './form-array/form-array-group.type';
export { formArrayList } from './form-array/form-array-list';
export * from './form-array/form-array-list.type';
export {
  useAreaControl,
  useFormControl,
  useInputControl,
  useReactControl
} from './form-control/form-control';
export * from './form-control/form-control.type';
export { useFormGroup } from './form-group/form-group';
export * from './form-group/form-group.type';
export { useNumberRefControl, useTextRefControl } from './form-ref/form-ref';
export * from './helpers';
export * from './hooks';

export type ReactControl<E extends HTMLElement = HTMLElement, T = any> =
  | ReactFormControl<E, T>
  | ReactArrayControl<E, T>;
