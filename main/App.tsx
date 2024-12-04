import React from 'react';
import {
  formArrayGroup,
  inputArrayControl,
  ReactArrayControls,
  ReactControls,
  ReactFormArray,
  ReactInputArrayControl,
  useFormArray,
  useFormGroup
} from '../src';
import './index.css';

interface PersonArrayControls extends ReactArrayControls {
  name: ReactInputArrayControl<string>;
  occupation: ReactInputArrayControl<string>;
  salary: ReactInputArrayControl<number>;
}

interface EmployeeGroup extends ReactControls {
  persons: ReactFormArray<PersonArrayControls, unknown>;
}

export function App() {
  const employees = useFormGroup<EmployeeGroup>({
    controls: {
      persons: useFormArray([])
    }
  });

  function onLog(): void {
    console.log(employees.value);
  }

  function onNewPerson(): void {
    employees.controls.persons.push(
      formArrayGroup({
        name: inputArrayControl(''),
        occupation: inputArrayControl(''),
        salary: inputArrayControl(0)
      })
    );
  }

  return (
    <div className="employees">
      <label>Listado de empleados</label>

      <div className="collection">
        {employees.controls.persons.groups.map((person, index) => (
          <div className="person" key={index}>
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
          </div>
        ))}
      </div>

      <div className="actions">
        <button onClick={onLog}>Log</button>
        <button onClick={onNewPerson}>New Person</button>
      </div>
    </div>
  );
}
