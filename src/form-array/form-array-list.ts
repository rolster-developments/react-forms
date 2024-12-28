import { ArrayControlsValue, ArrayListValueToControls } from '@rolster/forms';
import { controlsAllChecked, controlsToValue } from '@rolster/forms/helpers';
import { ValidatorFn } from '@rolster/validators';
import { v4 as uuid } from 'uuid';
import {
  ReactArrayControls,
  ReactArrayList,
  ReactArrayListOptions
} from '../types';
import { RolsterReactArrayControl } from './form-array-control';

export class RolsterArrayList<
    E extends HTMLElement = HTMLElement,
    C extends ReactArrayControls = ReactArrayControls
  >
  extends RolsterReactArrayControl<E, ArrayControlsValue<C>[]>
  implements ReactArrayList<C>
{
  public readonly controls: C[];

  public readonly invalid: boolean;

  public readonly valid: boolean;

  public readonly wrong: boolean;

  protected valueToControls: ArrayListValueToControls<C>;

  constructor(options: ReactArrayListOptions<C>) {
    super(options);

    this.valueToControls = options.valueToControls;

    this.controls = options.value.map((value) => this.createControls(value));

    this.valid =
      this.errors.length === 0 &&
      this.controls.reduce(
        (valid, controls) => valid && controlsAllChecked(controls, 'valid'),
        true
      );

    this.invalid = !this.valid;
    this.wrong = this.touched && this.invalid;
  }

  public push(value: ArrayControlsValue<C>): void {
    this.refresh({ value: [...this.value, value] });
  }

  public remove(controls: C): void {
    this.refresh({
      value: this.controls
        .filter((currentControls) => currentControls !== controls)
        .map((controls) => controlsToValue(controls))
    });
  }

  public clone(options: ReactArrayListOptions<C>): RolsterArrayList<E, C> {
    return new RolsterArrayList(options);
  }

  protected refresh(changes: Partial<ReactArrayListOptions<C>>): void {
    super.refresh(changes);
  }

  private createControls(value: ArrayControlsValue<C>): C {
    const controls = this.valueToControls(value);

    Object.values(controls).forEach((control) => {
      control.subscribe((options) => {
        const value = this.controls
          .map((currentControls) =>
            currentControls !== controls
              ? currentControls
              : Object.entries(controls).reduce((controls, [key, control]) => {
                  (controls as any)[key] =
                    control.uuid === options.uuid
                      ? control.clone(options)
                      : control;

                  return controls;
                }, {} as C)
          )
          .map((controls) => controlsToValue(controls));

        this.refresh({ value });
      });
    });

    return controls;
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
  const value = options.value || [];

  return new RolsterArrayList<HTMLElement, C>({
    ...options,
    value,
    initialValue: value,
    uuid: uuid()
  });
}
