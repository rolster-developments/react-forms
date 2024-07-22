import {
  ArrayStateGroup,
  ArrayValueGroup,
  FormArrayGroupProps,
  ValidatorGroupFn,
  createFormGroupProps
} from '@rolster/forms';
import {
  controlsAllChecked,
  controlsPartialChecked,
  controlsToState,
  controlsToValue,
  groupIsValid
} from '@rolster/forms/helpers';
import { ValidatorError } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import {
  AbstractRolsterArrayGroup,
  RolsterArrayControls,
  RolsterFormArray
} from './types';

export class RolsterArrayGroup<
  C extends RolsterArrayControls = RolsterArrayControls,
  R = any
> implements AbstractRolsterArrayGroup<C, R>
{
  public readonly uuid: string;
  public readonly resource?: R;
  public readonly controls: C;
  public readonly dirty: boolean;
  public readonly dirties: boolean;
  public readonly errors: ValidatorError<any>[];
  public readonly invalid: boolean;
  public readonly pristine: boolean;
  public readonly pristines: boolean;
  public readonly touched: boolean;
  public readonly toucheds: boolean;
  public readonly untouched: boolean;
  public readonly untoucheds: boolean;
  public readonly valid: boolean;
  public readonly wrong: boolean;
  public readonly error?: ValidatorError<any>;
  public readonly validators?: ValidatorGroupFn<C>[];

  public readonly state: ArrayStateGroup<C>;
  public readonly value: ArrayValueGroup<C>;

  parent?: RolsterFormArray<C>;

  constructor(props: FormArrayGroupProps<C, R>) {
    const { controls, resource, uuid, validators } = props;

    Object.values(controls).forEach((control) => {
      //control.group = this;
    });

    this.uuid = uuid;
    this.controls = controls;
    this.validators = validators;
    this.resource = resource;

    this.errors = validators ? groupIsValid({ controls, validators }) : [];

    this.error = this.errors[0];
    this.valid =
      this.errors.length === 0 && controlsAllChecked(controls, 'valid');
    this.invalid = !this.valid;

    this.touched = controlsPartialChecked(controls, 'touched');
    this.toucheds = controlsAllChecked(controls, 'touched');
    this.dirty = controlsPartialChecked(controls, 'dirty');
    this.dirties = controlsAllChecked(controls, 'dirty');

    this.untouched = !this.touched;
    this.untoucheds = !this.toucheds;
    this.pristine = !this.dirty;
    this.pristines = !this.dirties;

    this.wrong = this.touched && this.invalid;

    this.state = controlsToState(controls);
    this.value = controlsToValue(controls);
  }

  public setValidators(validators: ValidatorGroupFn<C>[]): void {
    this.parent?.refreshGroup(this, { validators });
  }
}

type RolsterGroupProps<
  C extends RolsterArrayControls = RolsterArrayControls,
  R = any
> = Omit<FormArrayGroupProps<C, R>, 'uuid'>;

export function useFormArrayGroup<
  C extends RolsterArrayControls = RolsterArrayControls,
  R = any
>(props: RolsterGroupProps<C, R>): AbstractRolsterArrayGroup<C, R>;
export function useFormArrayGroup<
  C extends RolsterArrayControls = RolsterArrayControls,
  R = any
>(
  controls: C,
  validators?: ValidatorGroupFn<C, R>[]
): AbstractRolsterArrayGroup<C, R>;
export function useFormArrayGroup<
  C extends RolsterArrayControls = RolsterArrayControls,
  R = any
>(
  groupProps: RolsterGroupProps<C, R> | C,
  groupValidators?: ValidatorGroupFn<C, R>[]
): AbstractRolsterArrayGroup<C, R> {
  const props = createFormGroupProps<C, RolsterGroupProps<C, R>>(
    groupProps,
    groupValidators
  );

  return new RolsterArrayGroup({ ...props, uuid: uuid() });
}
