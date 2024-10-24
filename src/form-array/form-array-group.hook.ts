import {
  ArrayStateGroup,
  FormArrayGroupOptions,
  ValidatorGroupFn
} from '@rolster/forms';
import { createFormGroupOptions } from '@rolster/forms/arguments';
import {
  controlsAllChecked,
  controlsPartialChecked,
  controlsToValue,
  groupIsValid
} from '@rolster/forms/helpers';
import { ValidatorError } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import {
  ReactArrayControls,
  ReactArrayGroup,
  ReactSubscriberControl,
  ReactSubscriberGroup
} from '../types';
import { RolsterArrayControl } from './form-array-control.hook';

export class RolsterArrayGroup<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
> implements ReactArrayGroup<C, R>
{
  public readonly uuid: string;
  public readonly controls: C;
  public readonly value: ArrayStateGroup<C>;
  public readonly dirty: boolean;
  public readonly dirtyAll: boolean;
  public readonly errors: ValidatorError<any>[];
  public readonly invalid: boolean;
  public readonly pristine: boolean;
  public readonly pristineAll: boolean;
  public readonly touched: boolean;
  public readonly touchedAll: boolean;
  public readonly untouched: boolean;
  public readonly untouchedAll: boolean;
  public readonly valid: boolean;
  public readonly wrong: boolean;
  public readonly error?: ValidatorError<any>;
  public readonly validators?: ValidatorGroupFn<C>[];
  public readonly resource?: R;

  private subscriber?: ReactSubscriberGroup<C, R>;

  constructor(options: FormArrayGroupOptions<C, R>) {
    const { controls, resource, uuid, validators } = options;

    this.uuid = uuid;
    this.controls = controls;
    this.validators = validators;
    this.resource = resource;

    this.errors = validators ? groupIsValid({ controls, validators }) : [];
    this.error = this.errors[0];
    this.valid =
      this.errors.length === 0 && controlsAllChecked(controls, 'valid');
    this.invalid = !this.valid;

    this.dirty = controlsPartialChecked(controls, 'dirty');
    this.dirtyAll = controlsAllChecked(controls, 'dirty');
    this.touched = controlsPartialChecked(controls, 'touched');
    this.touchedAll = controlsAllChecked(controls, 'touched');

    this.untouched = !this.touched;
    this.untouchedAll = !this.touchedAll;
    this.pristine = !this.dirty;
    this.pristineAll = !this.dirtyAll;

    this.wrong = this.touched && this.invalid;

    this.value = controlsToValue(controls);

    const subscriber: ReactSubscriberControl = (options) => {
      this.update({
        controls: Object.entries(this.controls).reduce(
          (controls: ReactArrayControls, [key, control]) => {
            controls[key] =
              control.uuid === options.uuid
                ? new RolsterArrayControl(options)
                : control;

            return controls;
          },
          {}
        )
      });
    };

    Object.values(controls).forEach((control) => {
      control.subscribe(subscriber);
    });
  }

  public setValidators(validators: ValidatorGroupFn<C>[]): void {
    this.update({ validators });
  }

  public subscribe(listener: ReactSubscriberGroup<C, R>): void {
    this.subscriber = listener;
  }

  private update(changes: Partial<ReactSubscriberGroup<C, R>>): void {
    if (this.subscriber) {
      this.subscriber({ ...this, ...changes });
    }
  }
}

type RolsterGroupOptions<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
> = Omit<FormArrayGroupOptions<C, R>, 'uuid'>;

export function useFormArrayGroup<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
>(options: RolsterGroupOptions<C, R>): ReactArrayGroup<C, R>;
export function useFormArrayGroup<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
>(controls: C, validators?: ValidatorGroupFn<C, R>[]): ReactArrayGroup<C, R>;
export function useFormArrayGroup<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
>(
  options: RolsterGroupOptions<C, R> | C,
  validators?: ValidatorGroupFn<C, R>[]
): ReactArrayGroup<C, R> {
  const groupOptions = createFormGroupOptions<C, RolsterGroupOptions<C, R>>(
    options,
    validators
  );

  return new RolsterArrayGroup({ ...groupOptions, uuid: uuid() });
}
