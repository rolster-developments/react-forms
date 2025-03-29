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
import { replaceControl } from '../utilities';
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

    controls.forEach((reactControls) => {
      this._subscribe(reactControls);
    });
  }

  public setInitialValue(value: ArrayControlsValue<C>[]): void {
    this.refresh('list', {
      controls: value.map((value) => this.valueToControls(value)),
      initialValue: value
    });
  }

  public setValue(value: ArrayControlsValue<C>[]): void {
    this.refresh('list', {
      controls: value.map((value) => this.valueToControls(value))
    });
  }

  public reset(): void {
    this.refresh('list', {
      controls: this.initialValue.map((value) => this.valueToControls(value))
    });
  }

  public push(controls: C): void {
    this.refresh('list', {
      controls: [...this.controls, controls]
    });
  }

  public remove(controls: C): void {
    this.refresh('list', {
      controls: this.controls.filter((_controls) => _controls !== controls)
    });
  }

  protected builder(
    options: Options<C>
  ): ReactArrayControl<E, ArrayControlsValue<C>[]> {
    return new RolsterArrayList<E, C>({
      ...this,
      ...options,
      valueToControls: this.valueToControls
    });
  }

  protected refresh(action: ReactArrayAction, options: Options<C>): void {
    super.refresh(action, options);
  }

  private _subscribe(reactControls: C): void {
    Object.values(reactControls).forEach((control) => {
      control.subscribe((action, _control) => {
        const _reactControls = this.controls.map((_controls) =>
          reactControls !== _controls
            ? _controls
            : replaceControl(reactControls, _control)
        );

        this.refresh(action, { controls: _reactControls });
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
