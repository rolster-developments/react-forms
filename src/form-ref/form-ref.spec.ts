import { act, createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactInputControl } from '../form-control/form-control.type';
import { useTextRefControl } from './form-ref';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function renderTextRefInput(visible: boolean) {
  const result = {
    current: undefined as unknown as ReactInputControl<string>,
    setVisible: (_visible: boolean) => {}
  };

  function InputHost() {
    const formRef = useTextRefControl('rolster');
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
    const { container, result } = renderTextRefInput(true);

    const input = container.querySelector('input');

    expect(input).not.toBeNull();

    dispatchInputEvents(input as HTMLInputElement, 'react');

    expect(result.current.value).toBe('react');
    expect(result.current.dirty).toBe(true);
    expect(result.current.touched).toBe(true);
  });

  it('should register listeners when the input element is rendered after the first render', () => {
    const { container, result } = renderTextRefInput(false);

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
});
