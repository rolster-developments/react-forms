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

type RolsterListOptions<C extends ReactArrayControls = ReactArrayControls> =
  Omit<ReactArrayListOptions<C>, 'value'>;

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

  constructor(options: RolsterListOptions<C>) {
    const value = options.controls.map((controls) => controlsToValue(controls));

    super({ ...options, value });

    this.valueToControls = options.valueToControls;
    this.controls = options.controls;

    this.valid =
      this.errors.length === 0 &&
      this.controls.reduce(
        (valid, controls) => valid && controlsAllChecked(controls, 'valid'),
        true
      );

    this.invalid = !this.valid;
    this.wrong = this.touched && this.invalid;

    options.controls.forEach((controls) => {
      this.subscribeControls(controls);
    });
  }

  public setValue(value: ArrayControlsValue<C>[]): void {
    this.refresh({
      controls: value.map((value) => this.valueToControls(value))
    });
  }

  public clone(options: ReactArrayListOptions<C>): RolsterArrayList<E, C> {
    return new RolsterArrayList(options);
  }

  public push(controls: C): void {
    this.refresh({
      controls: [...this.controls, controls]
    });
  }

  public remove(controls: C): void {
    this.refresh({
      controls: this.controls.filter(
        (currentControls) => currentControls !== controls
      )
    });
  }

  protected refresh(changes: Partial<ReactArrayListOptions<C>>): void {
    super.refresh(changes);
  }

  private subscribeControls(newControls: C): void {
    Object.values(newControls).forEach((control) => {
      control.subscribe((options) => {
        const controls = this.controls.map((_controls) =>
          _controls !== newControls
            ? _controls
            : Object.entries(newControls).reduce((controls, [key, control]) => {
                (controls as any)[key] =
                  control.uuid === options.uuid
                    ? control.clone(options)
                    : control;

                return controls;
              }, {} as C)
        );

        this.refresh({ controls });
      });
    });
  }
}

interface ReactListOptions<C extends ReactArrayControls = ReactArrayControls> {
  touched?: boolean;
  validators?: ValidatorFn<ArrayControlsValue<C>[] | undefined>[];
  value?: ArrayControlsValue<C>[] | undefined;
}

export function formArrayList<
  C extends ReactArrayControls = ReactArrayControls
>(
  valueToControls: ArrayListValueToControls<C>,
  options?: ReactListOptions<C>
): ReactArrayList<C> {
  const value = options?.value || [];

  return new RolsterArrayList<HTMLElement, C>({
    ...options,
    valueToControls,
    controls: value.map((value) => valueToControls(value)),
    initialValue: value,
    uuid: uuid()
  });
}
