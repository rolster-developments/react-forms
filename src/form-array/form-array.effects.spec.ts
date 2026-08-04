import { act, createElement, Fragment, useEffect, useState } from 'react';
import { renderTree } from '../testing';
import { useFormArray } from './form-array';
import { inputArrayControl } from './form-array-control';
import { ReactInputArrayControl } from './form-array-control.type';
import { formArrayGroup } from './form-array-group';
import { ReactArrayControls, ReactArrayGroup } from './form-array-group.type';
import { formArrayList } from './form-array-list';
import { ReactArrayList } from './form-array-list.type';
import { ReactFormArray } from './form-array.type';

const RATE_TOTAL = 2;

interface PriceControls extends ReactArrayControls {
  price: ReactInputArrayControl<number>;
  total: ReactInputArrayControl<number>;
}

type PriceGroup = ReactArrayGroup<PriceControls>;

type PriceArrayResult = { current: ReactFormArray<PriceControls> };

function createPriceGroup(price: number, uuid?: string): PriceGroup {
  return formArrayGroup<PriceControls>({
    controls: {
      price: inputArrayControl(price),
      total: inputArrayControl(0)
    },
    uuid
  });
}

interface TotalEffectProps {
  formGroup: PriceGroup;
}

function TotalEffect({ formGroup }: TotalEffectProps) {
  useEffect(() => {
    formGroup.controls.total.setStartValue(
      formGroup.controls.price.value * RATE_TOTAL
    );
  }, [formGroup.controls.price.value]);

  return null;
}

interface PriceArrayHostProps {
  result: PriceArrayResult;
  groups?: PriceGroup[];
}

function PriceArrayHost({ groups, result }: PriceArrayHostProps) {
  const formArray = useFormArray<PriceControls>(groups);

  result.current = formArray;

  return createElement(
    Fragment,
    null,
    ...formArray.groups.map((formGroup) =>
      createElement(TotalEffect, { formGroup, key: formGroup.uuid })
    )
  );
}

function renderPriceArray(groups?: PriceGroup[]) {
  const result = {
    current: undefined as unknown as ReactFormArray<PriceControls>
  };

  const tree = renderTree(createElement(PriceArrayHost, { groups, result }));

  return { ...tree, result };
}

interface ItemControls extends ReactArrayControls {
  label: ReactInputArrayControl<string>;
}

interface OrderControls extends ReactArrayControls {
  code: ReactInputArrayControl<string>;
  items: ReactArrayList<ItemControls>;
}

type OrderGroup = ReactArrayGroup<OrderControls>;

function createOrderGroup(code: string): OrderGroup {
  return formArrayGroup<OrderControls>({
    controls: {
      code: inputArrayControl(code),
      items: formArrayList<ItemControls>({
        value: [],
        valueToControls: ({ label }) => ({ label: inputArrayControl(label) })
      })
    }
  });
}

interface ItemsEffectProps {
  formGroup: OrderGroup;
}

function ItemsEffect({ formGroup }: ItemsEffectProps) {
  useEffect(() => {
    formGroup.controls.items.setValue([
      { label: formGroup.controls.code.value }
    ]);
  }, [formGroup.controls.code.value]);

  return null;
}

interface OrderArrayHostProps {
  result: { current: ReactFormArray<OrderControls> };
  groups?: OrderGroup[];
}

function OrderArrayHost({ groups, result }: OrderArrayHostProps) {
  const formArray = useFormArray<OrderControls>(groups);

  result.current = formArray;

  return createElement(
    Fragment,
    null,
    ...formArray.groups.map((formGroup) =>
      createElement(ItemsEffect, { formGroup, key: formGroup.uuid })
    )
  );
}

describe('useFormArray with derived writes from child effects', () => {
  describe('initial groups', () => {
    it('should apply the total written by the effect of the child', () => {
      const { result } = renderPriceArray([createPriceGroup(1000)]);

      expect(result.current.value).toEqual([{ price: 1000, total: 2000 }]);
    });
  });

  describe('push', () => {
    it('should apply the total written by the effect of the child', () => {
      const { result } = renderPriceArray();

      act(() => {
        result.current.push(createPriceGroup(1000));
      });

      expect(result.current.value).toEqual([{ price: 1000, total: 2000 }]);
    });
  });

  describe('setValue', () => {
    it('should apply the total written by the effect of the child', () => {
      const { result } = renderPriceArray([createPriceGroup(0)]);

      act(() => {
        result.current.setValue([createPriceGroup(1000)]);
      });

      expect(result.current.value).toEqual([{ price: 1000, total: 2000 }]);
    });

    it('should find the replaced groups by uuid', () => {
      const { result } = renderPriceArray([createPriceGroup(0, 'group-empty')]);

      act(() => {
        result.current.setValue([createPriceGroup(1000, 'group-loaded')]);
      });

      expect(result.current.findByUuid('group-loaded')).toBeDefined();
      expect(result.current.findByUuid('group-empty')).toBeUndefined();
    });
  });

  describe('reset', () => {
    it('should apply the total written by the effect of the child', () => {
      const { result } = renderPriceArray([createPriceGroup(1000)]);

      act(() => {
        result.current.groups[0].controls.price.setValue(500);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.value).toEqual([{ price: 1000, total: 2000 }]);
    });
  });

  describe('group of a previous render', () => {
    it('should apply the value written through its controls', () => {
      const { result } = renderPriceArray([createPriceGroup(1000)]);

      const previousGroup = result.current.groups[0];

      act(() => {
        result.current.groups[0].controls.price.setValue(500);
      });

      act(() => {
        previousGroup.controls.total.setValue(7);
      });

      expect(result.current.value).toEqual([{ price: 500, total: 7 }]);
    });
  });

  describe('nested list', () => {
    it('should apply the items written by the effect of the child after setValue', () => {
      const result = {
        current: undefined as unknown as ReactFormArray<OrderControls>
      };

      renderTree(
        createElement(OrderArrayHost, { groups: [createOrderGroup('')], result })
      );

      act(() => {
        result.current.setValue([createOrderGroup('XIGP')]);
      });

      expect(result.current.value[0].items).toEqual([{ label: 'XIGP' }]);
    });
  });

  describe('host that renders only the selected group', () => {
    it('should apply the total of the group that becomes selected', () => {
      const result = {
        current: undefined as unknown as ReactFormArray<PriceControls>
      };

      const selector = { current: (_uuid: string) => {} };

      function SelectorHost({ groups }: { groups: PriceGroup[] }) {
        const formArray = useFormArray<PriceControls>(groups);
        const [uuid, setUuid] = useState(groups[0].uuid);

        result.current = formArray;
        selector.current = setUuid;

        const formGroup =
          formArray.groups.find((group) => group.uuid === uuid) ??
          formArray.groups[0];

        // The key ties the effect to the identity of the group: without it,
        // two groups with the same price share the dependencies of the effect
        // and the total of the group that becomes selected is never written
        return createElement(TotalEffect, { formGroup, key: formGroup.uuid });
      }

      const groups = [
        createPriceGroup(1000, 'group-first'),
        createPriceGroup(1000, 'group-second')
      ];

      renderTree(createElement(SelectorHost, { groups }));

      expect(result.current.value[0].total).toBe(2000);

      act(() => {
        selector.current('group-second');
      });

      expect(result.current.value[1].total).toBe(2000);
    });
  });

  describe('host that rebuilds the groups on every render', () => {
    it('should preserve the state of the array when it re-renders', () => {
      const result = {
        current: undefined as unknown as ReactFormArray<PriceControls>
      };

      function InlineHost() {
        const formArray = useFormArray<PriceControls>([createPriceGroup(1000)]);

        result.current = formArray;

        return null;
      }

      const { rerender } = renderTree(createElement(InlineHost));

      act(() => {
        result.current.groups[0].controls.price.setValue(500);
      });

      rerender();

      expect(result.current.value[0].price).toBe(500);
    });
  });
});
