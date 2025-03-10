import { ArrayControlsValue, ArrayListValueToControls } from '@rolster/forms';
import {
  controlIsValid,
  controlsAllChecked,
  controlsToValue
} from '@rolster/forms/helpers';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import {
  ReactArrayAction,
  ReactArrayControl,
  ReactArrayControlOptions,
  ReactArrayControls,
  ReactArrayList,
  ReactArrayListOptions
} from '../types';
import { RolsterArrayControl } from './form-array-control';

type RolsterListOptions<C extends ReactArrayControls = ReactArrayControls> =
  Omit<ReactArrayListOptions<C>, 'value'>;

interface ArrayControlOptions<T = any> extends ReactArrayControlOptions<T> {
  errors: ValidatorError<T>[];
}

interface Options<C extends ReactArrayControls = ReactArrayControls>
  extends Partial<ArrayControlOptions<ArrayControlsValue<C>[]>> {
  controls: C[];
}

class RolsterArrayList<
    E extends HTMLElement = HTMLElement,
    C extends ReactArrayControls = ReactArrayControls
  >
  extends RolsterArrayControl<E, ArrayControlsValue<C>[]>
  implements ReactArrayList<C>
{
  public readonly controls: C[];

  public readonly invalid: boolean;

  public readonly valid: boolean;

  public readonly wrong: boolean;

  protected valueToControls: ArrayListValueToControls<C>;

  constructor(options: RolsterListOptions<C>) {
    const { controls, valueToControls, validators } = options;

    const value = controls.map((controls) => controlsToValue(controls));
    const errors = validators ? controlIsValid({ value, validators }) : [];

    super({ ...options, errors, value });

    this.valueToControls = valueToControls;
    this.controls = controls;

    this.valid =
      errors.length === 0 &&
      controls.reduce(
        (valid, controls) => valid && controlsAllChecked(controls, 'valid'),
        true
      );

    this.invalid = !this.valid;
    this.wrong = this.touched && this.invalid;

    controls.forEach((controls) => {
      this._subscribe(controls);
    });
  }

  public setValue(value: ArrayControlsValue<C>[]): void {
    this.refresh('controls', {
      controls: value.map((value) => this.valueToControls(value))
    });
  }

  public push(controls: C): void {
    this.refresh('controls', {
      controls: [...this.controls, controls]
    });
  }

  public remove(controls: C): void {
    this.refresh('controls', {
      controls: this.controls.filter((_controls) => _controls !== controls)
    });
  }

  protected builder(
    options: Options<C>
  ): ReactArrayControl<E, ArrayControlsValue<C>[]> {
    return new RolsterArrayList({
      ...this,
      ...options,
      valueToControls: this.valueToControls
    });
  }

  protected refresh(action: ReactArrayAction, options: Options<C>): void {
    console.log(action, options)
    super.refresh(action, options);
  }

  private _subscribe(controls: C): void {
    Object.values(controls).forEach((control) => {
      control.subscribe((action, _control) => {
        const _controls = this.controls.map((_controls) =>
          _controls !== controls
            ? _controls
            : Object.entries(controls).reduce((controls, []) => {
                return controls;
              }, {} as C)
        );

        this.refresh(action, { controls: _controls });
      });
    });
  }
}

interface ReactListOptions<C extends ReactArrayControls = ReactArrayControls> {
  valueToControls: ArrayListValueToControls<C>;
  touched?: boolean;
  validators?: ValidatorFn<ArrayControlsValue<C>[] | undefined>[];
  value?: ArrayControlsValue<C>[] | undefined;
}

export function formArrayList<
  C extends ReactArrayControls = ReactArrayControls
>(options: ReactListOptions<C>): ReactArrayList<C> {
  const value = options?.value || [];

  return new RolsterArrayList<HTMLElement, C>({
    ...options,
    controls: value.map((value) => options.valueToControls(value)),
    initialValue: value,
    uuid: uuid()
  });
}
