import { ArrayControlsValue, ArrayListValueToControls } from '@rolster/forms';
import {
  controlsToValue,
  formControlIsValid,
  verifyAllTrueInControls
} from '@rolster/forms/helpers';
import { ValidatorError, ValidatorFn } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import {
  ReactArrayAction,
  ReactArrayControl,
  ReactArrayControlOptions
} from './form-array-control.type';
import { RolsterArrayControl } from './form-array-control';
import { replaceControl } from './form-array-group.helper';
import { ReactArrayControls } from './form-array-group.type';
import {
  ArrayListValueToUuid,
  ReactArrayList,
  ReactArrayListOptions
} from './form-array-list.type';

type RolsterListOptions<C extends ReactArrayControls = ReactArrayControls> =
  Omit<ReactArrayListOptions<C>, 'value'>;

interface ArrayControlOptions<T = any> extends ReactArrayControlOptions<T> {
  errors: ValidatorError<T>[];
}

interface Options<
  C extends ReactArrayControls = ReactArrayControls
> extends Partial<ArrayControlOptions<ArrayControlsValue<C>[]>> {
  controls: C[];
  controlsUuid?: string[];
}

class RolsterArrayList<
  E extends HTMLElement = HTMLElement,
  C extends ReactArrayControls = ReactArrayControls
>
  extends RolsterArrayControl<E, ArrayControlsValue<C>[]>
  implements ReactArrayList<C>
{
  public readonly controls: C[];

  public readonly controlsUuid: string[];

  public readonly invalid: boolean;

  public readonly valid: boolean;

  public readonly wrong: boolean;

  protected valueToControls: ArrayListValueToControls<C>;

  protected valueToUuid?: ArrayListValueToUuid<C>;

  constructor(options: RolsterListOptions<C>) {
    const { controls, controlsUuid, valueToControls, valueToUuid, validators } =
      options;

    const value = controls.map(controlsToValue);
    const errors = validators ? formControlIsValid({ value, validators }) : [];

    super({ ...options, errors, value });

    this.valueToControls = valueToControls;
    this.valueToUuid = valueToUuid;
    this.controls = controls;
    this.controlsUuid = controlsUuid ?? controls.map(() => uuid());

    this.valid =
      errors.length === 0 &&
      controls.reduce(
        (valid, controls) =>
          valid && verifyAllTrueInControls(controls, 'valid'),
        true
      );

    this.invalid = !this.valid;
    this.wrong = this.touched && this.invalid;

    controls.forEach((reactControls) => {
      this._subscribe(reactControls);
    });
  }

  public setDefaultValue(value: ArrayControlsValue<C>[]): void {
    console.log(value)
    console.log(this.generateControlsUuid(value))

    this.refresh('list', {
      controls: value.map(this.valueToControls),
      controlsUuid: this.generateControlsUuid(value),
      defaultValue: value
    });
  }

  public setStartValue(value: ArrayControlsValue<C>[]): void {
    this.refresh('list', {
      controls: value.map(this.valueToControls),
      controlsUuid: this.generateControlsUuid(value)
    });
  }

  public setValue(value: ArrayControlsValue<C>[]): void {
    console.log(value)
    console.log(this.generateControlsUuid(value))
    
    this.refresh('list', {
      controls: value.map(this.valueToControls),
      controlsUuid: this.generateControlsUuid(value),
      dirty: true
    });
  }

  public reset(): void {
    this.refresh('list', {
      controls: this.defaultValue.map(this.valueToControls),
      controlsUuid: this.generateControlsUuid(this.defaultValue),
      dirty: false,
      touched: false
    });
  }

  public push(controls: C): void {
    const _uuid = this.valueToUuid?.(controlsToValue(controls)) ?? uuid();

    this.refresh('list', {
      controls: [...this.controls, controls],
      controlsUuid: [...this.controlsUuid, _uuid]
    });
  }

  public remove(controls: C): void {
    const _controls: C[] = [];
    const _controlsUuid: string[] = [];

    this.controls.forEach((currentControls, index) => {
      if (currentControls !== controls) {
        _controls.push(currentControls);
        _controlsUuid.push(this.controlsUuid[index]);
      }
    });

    this.refresh('list', {
      controls: _controls,
      controlsUuid: _controlsUuid
    });
  }

  public findControlsByUuid(uuid: string): Undefined<C> {
    const index = this.controlsUuid.indexOf(uuid);

    return index >= 0 ? this.controls[index] : undefined;
  }

  protected builder(
    options: Options<C>
  ): ReactArrayControl<E, ArrayControlsValue<C>[]> {
    return new RolsterArrayList<E, C>({
      ...this,
      ...options,
      valueToControls: this.valueToControls,
      valueToUuid: this.valueToUuid
    });
  }

  protected refresh(action: ReactArrayAction, options: Options<C>): void {
    super.refresh(action, options);
  }

  private generateControlsUuid(values: ArrayControlsValue<C>[]): string[] {
    return values.map((value) => this.valueToUuid?.(value) ?? uuid());
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
  valueToUuid?: ArrayListValueToUuid<C>;
}

export function formArrayList<
  C extends ReactArrayControls = ReactArrayControls
>(options: ReactListOptions<C>): ReactArrayList<C> {
  const { valueToControls, valueToUuid } = options;
  const value = options?.value || [];

  return new RolsterArrayList<HTMLElement, C>({
    ...options,
    controls: value.map(valueToControls),
    controlsUuid: value.map((v) => valueToUuid?.(v) ?? uuid()),
    defaultValue: value,
    uuid: uuid()
  });
}
