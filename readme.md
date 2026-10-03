# Rolster React Forms

It implements a set of classes that allow managing the control of states of the input components in React.

## Installation

```
npm i @rolster/react-forms
```

## Configuration

You must install the `@rolster/types` to define package data types, which are configured by adding them to the `files` property of the `tsconfig.json` file.

```json
{
  "files": ["node_modules/@rolster/types/index.d.ts"]
}
```

## Features

The React binding of [`@rolster/forms`](https://www.npmjs.com/package/@rolster/forms). It keeps the same vocabulary — **controls**, **groups** and **arrays** — and the same validators from [`@rolster/validators`](https://www.npmjs.com/package/@rolster/validators), but the state does not live inside a class: every control is created by a **hook** that stores its state in `useState`, so any mutation (`setValue`, `touch`, `blur`, `reset`, …) re-renders the component that owns it.

That is the whole difference with the base package: there is no `subscribe`. The object a hook returns is an immutable snapshot rebuilt with `useMemo` on every state change, so you read `control.value`, `control.errors` or `group.valid` directly in the render, and React does the rest. Controls also expose an `elementRef` you can attach to the DOM node.

Items of an array are the exception: they are created by plain **factories** (`formArrayControl`, `formArrayGroup`) because they are built outside the render, and they notify the owning `useFormArray` through an internal subscription.

### Hooks

| Hook                      | Returns                       | Purpose                                              |
| ------------------------- | ----------------------------- | ---------------------------------------------------- |
| `useReactControl`         | `ReactFormControl<E, T>`      | A control for an explicit `HTMLElement` type         |
| `useFormControl`          | `ReactHtmlControl<T>`         | A control for a generic `HTMLElement`                |
| `useInputControl`         | `ReactInputControl<T>`        | A control for an `HTMLInputElement`                  |
| `useAreaControl`          | `ReactAreaControl`            | A `string` control for an `HTMLTextAreaElement`      |
| `useFormGroup`            | `ReactGroup<C>`               | Binds named controls together (a form)               |
| `useFormArray`            | `ReactFormArray<C, R, G>`     | A dynamic list of group items                        |
| `useReactList`            | `ReactFormList<E, T>`         | A control whose value is a list of items             |
| `useFormList`             | `ReactHtmlList<T>`            | `useReactList` for a generic `HTMLElement`           |
| `useTextRefControl`       | `ReactInputControl<string>`   | An input control driven by native DOM events         |
| `useNumberRefControl`     | `ReactInputControl<number>`   | Same, parsing the value as a `number`                |
| `useFormArrayGroupSelect` | `{ formGroup, setFormGroup }` | Keeps a selected group of an array always up to date |

### useReactControl, useFormControl, useInputControl, useAreaControl

The four of them are the same hook; they only differ in the element type they are bound to. Every one accepts either a single options object or the positional `(value, validators)` pair, and when the value is omitted the returned type is the `*Void` variant (the value may be `undefined`).

```typescript
useReactControl<E extends HTMLElement, T>(): ReactFormControl<E, T | undefined>;
useReactControl<E extends HTMLElement, T>(
  options: ReactControlOptions<T>
): ReactFormControl<E, T>;
useReactControl<E extends HTMLElement, T>(
  value: T,
  validators?: ValidatorFn<T>[]
): ReactFormControl<E, T>;
```

The options object is `{ value, validators?, touched?, formatter?, formatOn? }` — `touched` lets a control start as already interacted with, so `wrong` can show an error before the user touches the field; `formatter` and `formatOn` are described below.

```tsx
import { useAreaControl, useInputControl } from '@rolster/react-forms';
import { required, strMaxlength } from '@rolster/validators/helpers';

const age = useInputControl(18, [required]);
const notes = useAreaControl({ value: '', validators: [strMaxlength(240)] });
const alias = useInputControl<string>(); // ReactInputVoid<string>
```

**State flags:** `valid` / `invalid`, `dirty` / `pristine`, `touched` / `untouched`, `focused` / `unfocused`, `disabled` / `enabled`, and `wrong` (`touched && invalid`, ideal for deciding when to show an error).

**Key methods:** `setValue(value)` (also accepts an updater `(current) => next`, like `useState`), `setStartValue(value)` (updates the value without marking it dirty), `setDefaultValue(value)` (also replaces the value restored by `reset()`), `setValidators(validators)`, `reset()`, `disable()` / `enable()`, `focus()` / `blur()`, `touch()`, `hasError(id)`, `someErrors(ids)`.

#### Formatter

`formatter` is a pure `(value: T) => T` function that normalizes the value before it is stored, so validators and the rendered value always see the formatted result. `formatOn` decides when it runs: `'input'` (the default) applies it to the initial value and to every `setValue`, `setStartValue` and `setDefaultValue`, including the result of an updater; `'blur'` keeps the raw value while the user types and applies it when `blur()` is called. When the formatted value equals the current one the state does not change, so a rejected character does not re-render the component.

```tsx
import { useInputControl } from '@rolster/react-forms';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

function PhoneField() {
  const phone = useInputControl({ value: '', formatter: onlyDigits });
  const name = useInputControl({
    value: '',
    formatter: (value: string) => value.trim(),
    formatOn: 'blur'
  });

  // phone.setValue('30a1') stores '301'; name keeps ' Ana ' until name.blur()
}
```

Declare the formatter outside the component or wrap it in `useCallback`: the hook keeps the latest function in a ref, so an inline arrow still works, but a stable identity avoids re-running that effect on every render. The function must be **idempotent**, because the field components of `@rolster/react-components` apply it before writing the DOM and the control applies it again. The control exposes `formatter` and `formatOn` so a custom component can do the same. The array factories (`inputArrayControl`, `formArrayControl`, …) accept the same two options.

### useFormGroup

Binds a set of named controls and aggregates their state. It takes a `FormGroupOptions<C>` or the `(controls, validators?)` pair, and returns a `ReactGroup<C>`.

```tsx
import { useFormGroup, useInputControl } from '@rolster/react-forms';
import { email, required, strMinlength } from '@rolster/validators/helpers';

export function LoginForm() {
  const emailControl = useInputControl('', [required, email]);
  const passwordControl = useInputControl('', [required, strMinlength(8)]);

  const formGroup = useFormGroup({
    email: emailControl,
    password: passwordControl
  });

  const onSubmit = () => {
    const { email, password } = formGroup.value; // { email: string, password: string }

    login(email, password);
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={emailControl.value}
        onBlur={emailControl.blur}
        onFocus={emailControl.focus}
        onChange={(event) => emailControl.setValue(event.target.value)}
      />
      {emailControl.wrong && <span>{emailControl.error?.message}</span>}

      <input
        type="password"
        value={passwordControl.value}
        onBlur={passwordControl.blur}
        onChange={(event) => passwordControl.setValue(event.target.value)}
      />
      {passwordControl.hasError('minlength') && <span>Too short</span>}

      <button type="submit" disabled={formGroup.invalid}>
        Login
      </button>
      <button type="button" onClick={formGroup.reset}>
        Clear
      </button>
    </form>
  );
}
```

The group exposes both the "any" and the "all" variants of the child state: `dirty`/`dirties`, `pristine`/`pristines`, `touched`/`toucheds`, `untouched`/`untoucheds`, plus `valid`/`invalid`, `wrong`, `errors`/`error`, `value`, `controls`, `setValue(partial)`, `setValidators(validators)` and `reset()`.

### useFormArray

Manages a dynamic list of group items, each one with a stable `uuid`, for repeatable sections such as "add another phone". The items are built with the array factories, never with hooks, so they can be created inside an event handler.

```tsx
import {
  formArrayControl,
  formArrayGroup,
  useFormArray,
  ReactHtmlArrayControl
} from '@rolster/react-forms';
import { required } from '@rolster/validators/helpers';

type PhoneControls = {
  label: ReactHtmlArrayControl<string>;
  number: ReactHtmlArrayControl<string>;
};

function phoneGroup() {
  return formArrayGroup<PhoneControls>({
    controls: {
      label: formArrayControl('', [required]),
      number: formArrayControl('', [required])
    }
  });
}

export function PhonesForm() {
  const phones = useFormArray<PhoneControls>([]);

  return (
    <div>
      {phones.groups.map((group) => (
        <div key={group.uuid}>
          <input
            value={group.controls.number.value}
            onBlur={group.controls.number.blur}
            onChange={(event) =>
              group.controls.number.setValue(event.target.value)
            }
          />
          <button type="button" onClick={() => phones.remove(group)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={() => phones.push(phoneGroup())}>
        Add phone
      </button>

      <span>{phones.value.length} phones</span>
      <span>{phones.valid ? 'Ready' : 'Incomplete'}</span>
    </div>
  );
}
```

`useFormArray` accepts a `FormArrayOptions<C, R, G>`, a `groups` array or a factory `() => groups` (evaluated once, on mount). Besides the group state it offers `push(group)`, `merge(groups)`, `remove(group)`, `findByUuid(uuid)`, `setValue(groups)`, `setValidators(validators)` and `reset()`.

### useReactList and useFormList

A list control: a `ReactFormControl<E, T[]>` with `push(item)`, `remove(item)` and `clear()`. Every mutation goes through `setValue`, so the validators run and the component re-renders. The initial value also accepts a factory.

```tsx
import { useFormList } from '@rolster/react-forms';

const tags = useFormList<string>(['forms']);

tags.push('reactive'); // tags.value === ['forms', 'reactive']
tags.remove('forms');
tags.clear();
```

### useTextRefControl and useNumberRefControl

Uncontrolled inputs: instead of binding `value` and `onChange`, attach the `elementRef` to the element and the hook subscribes to its native `focus`, `blur` and `change` events. `useNumberRefControl` converts the raw string to a `number` before storing it.

```tsx
import { useTextRefControl } from '@rolster/react-forms';
import { required } from '@rolster/validators/helpers';

export function NameField() {
  const name = useTextRefControl('', [required]);

  return (
    <>
      <input ref={name.elementRef} defaultValue={name.value} />
      {name.wrong && <span>{name.error?.message}</span>}
    </>
  );
}
```

### useFormArrayGroupSelect

Selecting a group of a `useFormArray` and storing it in a `useState` would keep a stale snapshot, because every change replaces the group instance. This hook stores only the selection and resolves the current instance by `uuid` on each render.

```tsx
import { useFormArray, useFormArrayGroupSelect } from '@rolster/react-forms';

const phones = useFormArray<PhoneControls>([]);
const { formGroup, setFormGroup } = useFormArrayGroupSelect({
  formArray: phones
});

formGroup?.controls.number.value; // always the current value
setFormGroup(undefined); // closes the selection
```

### Array factories

The items of a `useFormArray` (and of a `formArrayList`) are created outside the render, so they are plain functions instead of hooks. Use them whenever a control has to be built inside an event handler, a `map` or a repository mapper; use the hooks for the fixed fields of a form.

| Factory             | Returns                     | Purpose                                            |
| ------------------- | --------------------------- | -------------------------------------------------- |
| `reactArrayControl` | `ReactArrayControl<E, T>`   | Array control for an explicit element type         |
| `formArrayControl`  | `ReactHtmlArrayControl<T>`  | Array control for a generic `HTMLElement`          |
| `inputArrayControl` | `ReactInputArrayControl<T>` | Array control for an `HTMLInputElement`            |
| `areaArrayControl`  | `ReactAreaArrayControl`     | `string` array control for a `HTMLTextAreaElement` |
| `formArrayGroup`    | `ReactArrayGroup<C, R>`     | A group item of a `useFormArray`                   |
| `formArrayList`     | `ReactArrayList<C>`         | A control whose value is a list of control sets    |

The control factories share the overloads of their hook counterparts (options object or `(value, validators)`), and every control carries a `uuid`. `formArrayGroup` accepts `{ controls, validators?, resource?, uuid? }` or `(controls, validators?)`; `resource` is the original payload the item was built from, handy when mapping it back to your domain model.

```typescript
import { formArrayControl, formArrayGroup } from '@rolster/react-forms';

const item = formArrayGroup({
  controls: { number: formArrayControl('3001234567') },
  resource: { id: 7 }
});

item.resource; // { id: 7 }
item.controls.number.setValue('3007654321');
```

`formArrayList` takes a single options object — `{ valueToControls, value?, validators?, valueToUuid?, touched? }` — where `valueToControls` builds the controls of every item. Use `push(controls)` / `remove(controls)` to mutate the list and `findControlsByUuid(uuid)` to reach one item:

```typescript
import { formArrayControl, formArrayList } from '@rolster/react-forms';

const tags = formArrayList({
  valueToControls: ({ name }) => ({ name: formArrayControl(name) }),
  value: [{ name: 'forms' }]
});

tags.push({ name: formArrayControl('reactive') });
tags.controls.length; // 2
```

### Helpers

| Helper                             | Description                                          |
| ---------------------------------- | ---------------------------------------------------- |
| `reduceControlsToValues(controls)` | Collects the `value` of every control into an array. |
| `reduceGroupToValues(group)`       | Same as above, reading `group.controls`.             |

```typescript
import { reduceGroupToValues } from '@rolster/react-forms';

reduceGroupToValues(formGroup); // ['daniel@rolster.com', '12345678']
```

### Custom validators

A validator is a `ValidatorFn<T>` from `@rolster/validators`: it receives the value and returns a `ValidatorError` (invalid) or `undefined` (valid). Group validators are `ValidatorGroupFn<C>` (they receive the `controls`) and array validators are `ValidatorArrayFn<C, R>` (they receive the `groups`).

```typescript
import { useInputControl } from '@rolster/react-forms';
import { ValidatorFn } from '@rolster/validators';

const isEven: ValidatorFn<number> = (value) =>
  value && value % 2 !== 0
    ? { id: 'even', message: 'Value must be even' }
    : undefined;

const amount = useInputControl(3, [isEven]);

amount.hasError('even'); // true
```

### Types

| Type                      | Description                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `ReactFormControl<E, T>`  | Contract of a control: value, state flags, `setValue`, `elementRef`, `formatter`/`formatOn`. |
| `ReactHtmlControl<T>`     | `ReactFormControl<HTMLElement, T>`.                                                          |
| `ReactInputControl<T>`    | `ReactFormControl<HTMLInputElement, T>`.                                                     |
| `ReactAreaControl`        | `ReactFormControl<HTMLTextAreaElement, string>`.                                             |
| `ReactControls<T>`        | Record of controls: the shape accepted by `useFormGroup`.                                    |
| `ReactGroup<C>`           | The group returned by `useFormGroup`.                                                        |
| `ReactFormArray<C, R, G>` | The array returned by `useFormArray`.                                                        |
| `ReactArrayGroup<C, R>`   | A group item of an array, with `uuid` and `resource`.                                        |
| `ReactArrayControls<T>`   | Record of `ReactArrayControl`s: the controls shape of an array group.                        |
| `ReactFormList<E, T>`     | The list control returned by `useReactList` / `useFormList`.                                 |
| `ReactControl<E, T>`      | `ReactFormControl \| ReactArrayControl`: accepts both kinds of control.                      |

Every control type has a `*Void` variant — `ReactFormVoid`, `ReactHtmlVoid`, `ReactInputVoid`, `ReactAreaVoid`, and the array `ReactArrayVoid`, `ReactHtmlArrayVoid`, `ReactInputArrayVoid`, `ReactAreaArrayVoid` — which is the same type with `T | undefined` as value. It is what the hooks and factories return when they are created without an initial value.

Components should type their props with `ReactControl` (or the union `ReactHtmlControl | ReactHtmlArrayControl`) when they must work both with a control of a form and with a control of an array item:

```tsx
import { ReactControl } from '@rolster/react-forms';

interface FieldProps {
  formControl: ReactControl<HTMLInputElement, string>;
  label: string;
}

export function Field({ formControl, label }: FieldProps) {
  return (
    <label>
      {label}
      <input
        value={formControl.value}
        onBlur={formControl.blur}
        onChange={(event) => formControl.setValue(event.target.value)}
      />
    </label>
  );
}
```

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
