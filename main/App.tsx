import { reduceControlsToArray } from '@rolster/forms/helpers';
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

  useEffect(
    () => {
      console.log('Cambio en controles');
    },
    reduceControlsToArray(employees.controls, 'value')
  );

  function onLog(): void {
    employees.reset();
  }

  function onNewPerson(): void {
    employees.controls.persons.push(
      formArrayGroup({
        name: inputArrayControl<string>('', [required]),
        occupation: inputArrayControl<string>('', [required]),
        phones: formArrayList<PhoneArrayControls>(({ country, number }) => ({
          country: inputArrayControl(country),
          number: inputArrayControl(number)
        })),
        salary: inputArrayControl(0)
      })
    );
  }

  function onNewPhone(): void {
    const person = employees.controls.persons.groups[0];

    if (person) {
      person.controls.phones.push({
        country: inputArrayControl(''),
        number: inputArrayControl('')
      });
    }
  }

  function onValidator(): void {
    employees.controls.superuser.setValue('Daniel Castillo');
    employees.controls.role.setValue('Ing de software');
    employees.controls.age.setValue(25);
  }

  return (
    <div className="employees">
      <label>Listado de empleados</label>

      {employees.valid && <label>Todo esta Perfecto</label>}

      {employees.controls.superuser.focused && (
        <span>Estoy enfocado input superuser</span>
      )}

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

      <input
        value={employees.controls.role.value}
        onInput={(event) => {
          employees.controls.role.setValue(
            (event.target as HTMLInputElement).value
          );
        }}
      />

      <input
        value={employees.controls.age.value}
        onInput={(event) => {
          employees.controls.age.setValue(
            +(event.target as HTMLInputElement).value
          );
        }}
      />

      <input
        value={employees.controls.address.value}
        onInput={(event) => {
          employees.controls.address.setValue(
            (event.target as HTMLInputElement).value
          );
        }}
      />

      <div className="collection">
        {employees.controls.persons.groups.map((person, index) => (
          <div className="person" key={index}>
            <div className="person__body">
              <input
                value={person.controls.name.value}
                onInput={(event) => {
                  person.controls.name.setValue(
                    (event.target as HTMLInputElement).value
                  );
                }}
              />

              <input
                value={person.controls.occupation.value}
                onInput={(event) => {
                  person.controls.occupation.setValue(
                    (event.target as HTMLInputElement).value
                  );
                }}
              />

              <input
                value={person.controls.salary.value}
                onInput={(event) => {
                  person.controls.salary.setValue(
                    +(event.target as HTMLInputElement).value
                  );
                }}
              />

              {person.invalid && <label>Error in data</label>}
            </div>

            {person.controls.phones.controls.map((phones, index) => {
              return (
                <div key={index} className="person__phone">
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
                  <input
                    value={phones.number.value}
                    onInput={(event) => {
                      phones.number.setValue(
                        (event.target as HTMLInputElement).value
                      );
                    }}
                  />
                  <button
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
        <button onClick={onValidator}>Remove valid</button>
      </div>
    </div>
  );
}
