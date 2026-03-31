import {
  ControlsValue,
  FormArrayGroupOptions,
  ValidatorGroupFn
} from '@rolster/forms';
import { createFormGroupOptions } from '@rolster/forms/helpers';
import {
  controlsToValue,
  formGroupIsValid,
  verifyAllTrueInControls,
  verifyAnyTrueInControls
} from '@rolster/forms/helpers';
import { ValidatorError } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import {
  ReactArrayAction,
  ReactArrayControlSubscriber
} from './form-array-control.type';
import { replaceControl } from './form-array-group.helper';
import {
  ReactArrayControls,
  ReactArrayGroup,
  ReactArrayGroupSubscriber
} from './form-array-group.type';

interface ArrayGroupOptions<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
> extends FormArrayGroupOptions<C, R> {
  value: ControlsValue<C>;
  errors: ValidatorError<any>[];
  dirties?: boolean;
  dirty?: boolean;
  touched?: boolean;
  toucheds?: boolean;
  valid?: boolean;
}

type Options<C extends ReactArrayControls, R = any> = Partial<
  ArrayGroupOptions<C, R>
>;

function refactorForValid<C extends ReactArrayControls = ReactArrayControls>(
  controls: C,
  validators?: ValidatorGroupFn<C>[]
) {
  const errors = validators ? formGroupIsValid({ controls, validators }) : [];

  return {
    errors,
    valid: errors.length === 0 && verifyAllTrueInControls(controls, 'valid')
  };
}

function refactorForControls<C extends ReactArrayControls = ReactArrayControls>(
  action: ReactArrayAction,
  group: RolsterArrayGroup<C>,
  controls: C
) {
  switch (action) {
    case 'focused':
    case 'touched':
      return {
        touched: verifyAnyTrueInControls(controls, 'touched'),
        toucheds: verifyAllTrueInControls(controls, 'touched')
      };

    case 'validators':
      return refactorForValid(controls, group.validators);

    case 'reset':
      return {
        ...refactorForValid(controls, group.validators),
        dirty: verifyAnyTrueInControls(controls, 'dirty'),
        dirties: verifyAllTrueInControls(controls, 'dirty'),
        touched: verifyAnyTrueInControls(controls, 'touched'),
        toucheds: verifyAllTrueInControls(controls, 'touched'),
        value: controlsToValue(controls)
      };

    case 'list':
    case 'value':
      return {
        ...refactorForValid(controls, group.validators),
        dirty: verifyAnyTrueInControls(controls, 'dirty'),
        dirties: verifyAllTrueInControls(controls, 'dirty'),
        value: controlsToValue(controls)
      };

    default:
      return {};
  }
}

export class RolsterArrayGroup<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
> implements ReactArrayGroup<C, R> {
  public readonly uuid: string;

  public readonly controls: C;

  public readonly value: ControlsValue<C>;

  public readonly dirty: boolean;

  public readonly dirties: boolean;

  public readonly pristine: boolean;

  public readonly pristines: boolean;

  public readonly touched: boolean;

  public readonly toucheds: boolean;

  public readonly untouched: boolean;

  public readonly untoucheds: boolean;

  public readonly valid: boolean;

  public readonly invalid: boolean;

  public readonly wrong: boolean;

  public readonly errors: ValidatorError<any>[];

  public readonly error?: ValidatorError<any>;

  public readonly validators?: ValidatorGroupFn<C>[];

  public readonly resource?: R;

  private subscriberControl: ReactArrayControlSubscriber;

  private subscriber?: ReactArrayGroupSubscriber<C, R>;

  constructor(options: ArrayGroupOptions<C, R>) {
    this.uuid = options.uuid;
    this.controls = options.controls;
    this.value = options.value;
    this.resource = options.resource;
    this.dirty = !!options.dirty;
    this.dirties = !!options.dirties;
    this.pristine = !this.dirty;
    this.pristines = !this.dirties;
    this.touched = !!options.touched;
    this.toucheds = !!options.toucheds;
    this.untouched = !this.touched;
    this.untoucheds = !this.toucheds;
    this.valid = !!options.valid;
    this.invalid = !this.valid;
    this.wrong = this.touched && this.invalid;

    this.errors = options.errors;
    this.error = this.errors[0];
    this.validators = options.validators;

    this.subscriberControl = (action, control) => {
      const controls = replaceControl(this.controls, control);

      this.refresh(action, {
        ...refactorForControls(action, this, controls),
        controls
      });
    };
  }

  public subscribe(subscriber: ReactArrayGroupSubscriber<C, R>): void {
    this.subscriber = subscriber;

    Object.values(this.controls).forEach((control) => {
      control.subscribe(this.subscriberControl);
    });
  }

  public setValidators(validators: ValidatorGroupFn<C, any>[]): void {
    this.refresh('validators', {
      ...refactorForValid(this.controls, validators),
      validators
    });
  }

  public setResource(resource: Undefined<R>): void {
    this.refresh('resource', { resource });
  }

  protected refresh(action: ReactArrayAction, options: Options<C, R>): void {
    this.subscriber &&
      this.subscriber(action, new RolsterArrayGroup({ ...this, ...options }));
  }
}

class ReactRolsterArrayGroup<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
> extends RolsterArrayGroup<C, R> {
  constructor(options: FormArrayGroupOptions<C, R>) {
    const { controls, validators } = options;

    const errors = validators ? formGroupIsValid({ controls, validators }) : [];

    super({
      ...options,
      errors,
      dirties: verifyAllTrueInControls(controls, 'dirty'),
      dirty: verifyAnyTrueInControls(controls, 'dirty'),
      touched: verifyAnyTrueInControls(controls, 'touched'),
      toucheds: verifyAllTrueInControls(controls, 'touched'),
      valid: errors.length === 0 && verifyAllTrueInControls(controls, 'valid'),
      value: controlsToValue(controls)
    });
  }
}

interface ReactGroupOptions<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
> extends Omit<FormArrayGroupOptions<C, R>, 'uuid'> {
  uuid?: string;
}

function valueIsGroupOptions<
  C extends ReactArrayControls,
  O extends ReactGroupOptions<C>
>(options: any): options is O {
  return typeof options === 'object' && 'controls' in options;
}

export function formArrayGroup<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
>(options: ReactGroupOptions<C, R>): ReactArrayGroup<C, R>;
export function formArrayGroup<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
>(controls: C, validators?: ValidatorGroupFn<C, R>[]): ReactArrayGroup<C, R>;
export function formArrayGroup<
  C extends ReactArrayControls = ReactArrayControls,
  R = any
>(
  options: ReactGroupOptions<C, R> | C,
  validators?: ValidatorGroupFn<C, R>[]
): ReactArrayGroup<C, R> {
  const _uuid = valueIsGroupOptions(options) ? options.uuid || uuid() : uuid();

  return new ReactRolsterArrayGroup({
    ...createFormGroupOptions<C, ReactGroupOptions<C, R>>(options, validators),
    uuid: _uuid
  });
}
