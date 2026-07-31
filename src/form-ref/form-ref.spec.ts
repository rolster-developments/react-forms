import { ValidatorFn } from '@rolster/validators';
import { act, createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactInputControl } from '../form-control/form-control.type';
import '../testing';
import { useNumberRefControl, useTextRefControl } from './form-ref';

const required: ValidatorFn<string> = (value) =>
  value ? undefined : { id: 'required', message: 'Value is required' };

function renderRefInput<T>(
  useRefControl: () => ReactInputControl<T>,
  visible = true
) {
  const result = {
    current: undefined as unknown as ReactInputControl<T>,
    setVisible: (_visible: boolean) => {}
  };

  function InputHost() {
    const formRef = useRefControl();
    const [show, setShow] = useState(visible);

    result.current = formRef;
    result.setVisible = setShow;

    return show ? createElement('input', { ref: formRef.elementRef }) : null;
  }

  const container = document.createElement('div');
  const root = createRoot(container);

  act(() => {
    root.render(createElement(InputHost));
  });

  return {
    container,
    result,
    unmount: () => {
      act(() => {
        root.unmount();
      });
    }
  };
}

function dispatchInputEvents(input: HTMLInputElement, value: string) {
  act(() => {
    input.dispatchEvent(new Event('focus'));
  });

  input.value = value;

  act(() => {
    input.dispatchEvent(new Event('change'));
    input.dispatchEvent(new Event('blur'));
  });
}

describe('useTextRefControl', () => {
  it('should update the control from events of the input element', () => {
    const { container, result } = renderRefInput(() =>
      useTextRefControl('rolster')
    );

    const input = container.querySelector('input');

    expect(input).not.toBeNull();

    dispatchInputEvents(input as HTMLInputElement, 'react');

    expect(result.current.value).toBe('react');
    expect(result.current.dirty).toBe(true);
    expect(result.current.touched).toBe(true);
  });

  it('should register listeners when the input element is rendered after the first render', () => {
    const { container, result } = renderRefInput(
      () => useTextRefControl('rolster'),
      false
    );

    expect(container.querySelector('input')).toBeNull();

    act(() => {
      result.setVisible(true);
    });

    const input = container.querySelector('input');

    expect(input).not.toBeNull();

    dispatchInputEvents(input as HTMLInputElement, 'react');

    expect(result.current.value).toBe('react');
    expect(result.current.dirty).toBe(true);
    expect(result.current.touched).toBe(true);
  });

  it('should mark the control as focused while the input has focus', () => {
    const { container, result } = renderRefInput(() => useTextRefControl(''));

    const input = container.querySelector('input') as HTMLInputElement;

    act(() => {
      input.dispatchEvent(new Event('focus'));
    });

    expect(result.current.focused).toBe(true);

    act(() => {
      input.dispatchEvent(new Event('blur'));
    });

    expect(result.current.focused).toBe(false);
    expect(result.current.touched).toBe(true);
  });

  it('should evaluate validators over the value of the input', () => {
    const { container, result } = renderRefInput(() =>
      useTextRefControl({ validators: [required], value: 'rolster' })
    );

    expect(result.current.valid).toBe(true);

    const input = container.querySelector('input') as HTMLInputElement;

    dispatchInputEvents(input, '');

    expect(result.current.valid).toBe(false);
    expect(result.current.wrong).toBe(true);
    expect(result.current.error?.id).toBe('required');
  });
});

describe('useNumberRefControl', () => {
  it('should convert the value of the input element to number', () => {
    const { container, result } = renderRefInput(() =>
      useNumberRefControl(0)
    );

    const input = container.querySelector('input') as HTMLInputElement;

    dispatchInputEvents(input, '19');

    expect(result.current.value).toBe(19);
    expect(result.current.dirty).toBe(true);
  });
});
