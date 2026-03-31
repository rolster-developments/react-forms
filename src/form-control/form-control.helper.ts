import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { formControlIsValid } from '@rolster/forms/helpers';

export function errorsInControl<T = any>(
  value: T,
  validators?: ValidatorFn<T>[]
): ValidatorError<any>[] {
  return validators ? formControlIsValid({ value, validators }) : [];
}
