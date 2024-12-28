import { required } from '@rolster/validators/helpers';
import React from 'react';
import {
  formArrayGroup,
  formArrayList,
  inputArrayControl,
  ReactArrayControls,
  ReactArrayList,
  ReactControls,
  ReactFormArray,
  ReactInputArrayControl,
  useFormArray,
  useFormGroup
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
  persons: ReactFormArray<PersonArrayControls>;
}

export function App() {
  const employees = useFormGroup<EmployeeControls>({
    controls: {
      persons: useFormArray([])
    }
  });

  function onLog(): void {
    console.log(employees.invalid);
  }

  function onNewPerson(): void {
    employees.controls.persons.push(
      formArrayGroup({
        name: inputArrayControl<string>('', [required]),
        occupation: inputArrayControl<string>('', [required]),
        phones: formArrayList<PhoneArrayControls>({
          valueToControls: ({ country, number }) => ({
            country: inputArrayControl(country),
            number: inputArrayControl(number)
          })
        }),
        salary: inputArrayControl(0)
      })
    );
  }

  function onNewPhone(): void {
    const person = employees.controls.persons.groups[0];

    if (person) {
      person.controls.phones.push({ country: '', number: '' });
    }
  }

  return (
    <div className="employees">
      <label>Listado de empleados</label>

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

      {employees.valid && <label>Todo esta Perfecto</label>}

      <div className="actions">
        <button onClick={onLog}>Log</button>
        <button onClick={onNewPerson}>New Person</button>
        <button onClick={onNewPhone}>New Phone</button>
      </div>
    </div>
  );
}
