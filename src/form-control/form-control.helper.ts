import { formControlIsValid } from '@rolster/forms/helpers';
import { ValidatorError, ValidatorFn } from '@rolster/validators';

export function errorsInControl<T = any>(
  value: T,
  validators?: ValidatorFn<T>[]
): ValidatorError<any>[] {
  return validators ? formControlIsValid({ value, validators }) : [];
}
