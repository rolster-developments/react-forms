import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

export interface HookRender<T> {
  rerender: () => void;
  result: { current: T };
  unmount: () => void;
}

export function renderHook<T>(useHook: () => T): HookRender<T> {
  const result = { current: undefined as unknown as T };

  function HookHost() {
    result.current = useHook();

    return null;
  }

  const root = createRoot(document.createElement('div'));

  const render = () => {
    act(() => {
      root.render(createElement(HookHost));
    });
  };

  render();

  return {
    result,
    rerender: render,
    unmount: () => {
      act(() => {
        root.unmount();
      });
    }
  };
}
