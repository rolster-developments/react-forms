import { required } from '@rolster/validators/helpers';
import React, { useEffect } from 'react';
import {
  formArrayGroup,
  formArrayList,
  inputArrayControl,
  ReactArrayControls,
  ReactArrayList,
  ReactControls,
  ReactFormArray,
  ReactInputArrayControl,
  ReactInputControl,
  useFormArray,
  useFormGroup,
  useInputControl
} from '../src';
import './index.css';

interface PhoneArrayControls extends ReactArrayControls {
  id: ReactInputArrayControl<string>;
  country: ReactInputArrayControl<string>;
  number: ReactInputArrayControl<string>;
}

interface PersonArrayControls extends ReactArrayControls {
  name: ReactInputArrayControl<string>;
  occupation: ReactInputArrayControl<string>;
  phones: ReactArrayList<PhoneArrayControls>;
  salary: ReactInputArrayControl<number>;
}

interface EmployeeControls extends ReactControls {
  superuser: ReactInputControl<string>;
  role: ReactInputControl<string>;
  address: ReactInputControl<string>;
  age: ReactInputControl<number>;
  persons: ReactFormArray<PersonArrayControls>;
}

export function App() {
  const employees = useFormGroup<EmployeeControls>({
    controls: {
      superuser: useInputControl('Daniel', [required]),
      role: useInputControl('Ing de sistemas', [required]),
      address: useInputControl('', [required]),
      age: useInputControl(20),
      persons: useFormArray([])
    }
  });

  function onLog(): void {
    console.log(employees.dirty);
    console.log(employees.dirties);
    console.log(employees.value);
  }

  function onNewPerson(): void {
    employees.controls.persons.push(
      formArrayGroup({
        name: inputArrayControl<string>('', [required]),
        occupation: inputArrayControl<string>('', [required]),
        salary: inputArrayControl(0),
        phones: formArrayList<PhoneArrayControls>({
          valueToControls: ({ id, country, number }) => ({
            id: inputArrayControl(id),
            country: inputArrayControl(country),
            number: inputArrayControl(number)
          }),
          valueToUuid: (value) => {
            console.log('[valueToUuid]', value);
            return value.id;
          }
        })
      })
    );
  }

  function onNewPhone(): void {
    const person = employees.controls.persons.groups[0];

    if (person) {
      person.controls.phones.push({
        id: inputArrayControl<string>(crypto.randomUUID()),
        country: inputArrayControl(''),
        number: inputArrayControl('')
      });
    }
  }

  function onLoadPhones(): void {
    const person = employees.controls.persons.groups[0];

    if (person) {
      person.controls.phones.setValue([
        { id: 'phone-fixed-001', country: '+57', number: '3001112233' },
        { id: 'phone-fixed-002', country: '+1', number: '4155551234' },
        { id: 'phone-fixed-003', country: '+34', number: '600123456' }
      ]);
    }
  }

  function onLogControlsUuid(): void {
    const person = employees.controls.persons.groups[0];

    if (person) {
      console.log('[controlsUuid]', person.controls.phones.controlsUuid);
      console.log('[values]', person.controls.phones.value);
    }
  }

  function onFindByUuid(): void {
    const person = employees.controls.persons.groups[0];

    if (!person) return;

    const target = person.controls.phones.controlsUuid[0];

    if (!target) {
      console.log('[findByUuid] no hay teléfonos');
      return;
    }

    const found = person.controls.phones.findControlsByUuid(target);
    console.log('[findByUuid]', target, '→', found?.number.value);
  }

  function onRemoveValid(): void {
    employees.controls.superuser.setValue('Daniel Castillo');
    employees.controls.role.setValue('Ing de software');
    employees.controls.age.setValue(25);
  }

  function onChangesMultiple(): void {
    const person = employees.controls.persons.groups[0];

    if (person) {
      person.controls.name.setValue('Julio Trujillo');
      person.controls.occupation.setValue('Ingeniero de sistemas');
      person.controls.salary.setValue(2560);
    }
  }

  return (
    <div className="employees">
      <h2 className="employees__title">Listado de empleados</h2>

      {employees.valid && (
        <span className="employees__status employees__status--valid">
          Todo esta Perfecto
        </span>
      )}

      {employees.controls.superuser.focused && (
        <span className="employees__status">
          Estoy enfocado input superuser
        </span>
      )}

      <label className="field">
        <span className="field__label">Superuser</span>
        <input
          value={employees.controls.superuser.value}
          onInput={(event) => {
            employees.controls.superuser.setValue(
              (event.target as HTMLInputElement).value
            );
          }}
          onFocus={() => {
            employees.controls.superuser.focus();
          }}
          onBlur={() => {
            employees.controls.superuser.blur();
          }}
        />
      </label>

      <label className="field">
        <span className="field__label">Role</span>
        <input
          value={employees.controls.role.value}
          onInput={(event) => {
            employees.controls.role.setValue(
              (event.target as HTMLInputElement).value
            );
          }}
        />
      </label>

      <label className="field">
        <span className="field__label">Age</span>
        <input
          type="number"
          value={employees.controls.age.value}
          onInput={(event) => {
            employees.controls.age.setValue(
              +(event.target as HTMLInputElement).value
            );
          }}
        />
      </label>

      <label className="field">
        <span className="field__label">Address</span>
        <input
          value={employees.controls.address.value}
          onInput={(event) => {
            employees.controls.address.setValue(
              (event.target as HTMLInputElement).value
            );
          }}
        />
      </label>

      <div className="collection">
        {employees.controls.persons.groups.map((person, index) => (
          <div className="person" key={index}>
            <div className="person__body">
              <label className="field">
                <span className="field__label">Name</span>
                <input
                  value={person.controls.name.value}
                  onInput={(event) => {
                    person.controls.name.setValue(
                      (event.target as HTMLInputElement).value
                    );
                  }}
                />
              </label>

              <label className="field">
                <span className="field__label">Occupation</span>
                <input
                  value={person.controls.occupation.value}
                  onInput={(event) => {
                    person.controls.occupation.setValue(
                      (event.target as HTMLInputElement).value
                    );
                  }}
                />
              </label>

              <label className="field">
                <span className="field__label">Salary</span>
                <input
                  type="number"
                  value={person.controls.salary.value}
                  onInput={(event) => {
                    person.controls.salary.setValue(
                      +(event.target as HTMLInputElement).value
                    );
                  }}
                />
              </label>

              {person.invalid && (
                <span className="field__error">Error in data</span>
              )}
            </div>

            {person.controls.phones.controls.map((phones, index) => {
              const controlUuid = person.controls.phones.controlsUuid[index];

              return (
                <div key={controlUuid} className="person__phone">
                  <div className="person__phone__meta">
                    <span className="person__phone__meta__title">
                      controlsUuid
                    </span>
                    <span className="person__phone__meta__value">
                      {controlUuid}
                    </span>
                  </div>

                  <label className="field">
                    <span className="field__label">Country</span>
                    <input
                      className={phones.country.focused ? 'focus' : 'unfocus'}
                      onFocus={() => {
                        phones.country.focus();
                      }}
                      onBlur={() => {
                        phones.country.blur();
                      }}
                      value={phones.country.value}
                      onInput={(event) => {
                        phones.country.setValue(
                          (event.target as HTMLInputElement).value
                        );
                      }}
                    />
                  </label>

                  <label className="field">
                    <span className="field__label">Number</span>
                    <input
                      value={phones.number.value}
                      onInput={(event) => {
                        phones.number.setValue(
                          (event.target as HTMLInputElement).value
                        );
                      }}
                    />
                  </label>

                  <button
                    className="person__phone__remove"
                    onClick={() => {
                      const person = employees.controls.persons.groups[0];

                      if (person) {
                        person.controls.phones.remove(phones);
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="actions">
        <button onClick={onLog}>Log</button>
        <button onClick={onNewPerson}>New Person</button>
        <button onClick={onNewPhone}>New Phone</button>
        <button onClick={onRemoveValid}>Remove valid</button>
        <button onClick={onChangesMultiple}>Changes multiple</button>
        <button onClick={onLoadPhones}>Load phones (setValue)</button>
        <button onClick={onLogControlsUuid}>Log controlsUuid</button>
        <button onClick={onFindByUuid}>Find by UUID</button>
      </div>
    </div>
  );
}
