import { ValidatorFn } from '@rolster/validators';
import { formArrayControl } from './form-array-control';
import {
  ReactArrayAction,
  ReactHtmlArrayControl
} from './form-array-control.type';
import { formArrayList } from './form-array-list';
import { ReactArrayList } from './form-array-list.type';

interface ContactControls {
  name: ReactHtmlArrayControl<string>;
  [key: string]: ReactHtmlArrayControl<string>;
}

type ContactValue = { name: string };

function valueToControls(value: ContactValue): ContactControls {
  return { name: formArrayControl(value.name) };
}

const minTwoContacts: ValidatorFn<ContactValue[] | undefined> = (value) =>
  value && value.length >= 2
    ? undefined
    : { id: 'minContacts', message: 'List requires at least 2 contacts' };

interface ListTrack {
  actions: ReactArrayAction[];
  current: ReactArrayList<ContactControls>;
}

function trackList(list: ReactArrayList<ContactControls>): ListTrack {
  const track: ListTrack = { actions: [], current: list };

  const listen = (list: ReactArrayList<ContactControls>) => {
    list.subscribe((action, nextList) => {
      track.actions.push(action);
      track.current = nextList as ReactArrayList<ContactControls>;

      listen(track.current);
    });
  };

  listen(list);

  return track;
}

describe('formArrayList', () => {
  describe('initial state', () => {
    it('should create an empty list without initial value', () => {
      const list = formArrayList({ valueToControls });

      expect(list.value).toEqual([]);
      expect(list.controls).toEqual([]);
      expect(list.dirty).toBe(false);
      expect(list.touched).toBe(false);
      expect(list.valid).toBe(true);
    });

    it('should build the controls from the initial value', () => {
      const list = formArrayList({
        value: [{ name: 'rolster' }, { name: 'react' }],
        valueToControls
      });

      expect(list.controls.length).toBe(2);
      expect(list.controlsUuid.length).toBe(2);
      expect(list.value).toEqual([{ name: 'rolster' }, { name: 'react' }]);
      expect(list.controls[0].name.value).toBe('rolster');
    });

    it('should evaluate validators against the initial value', () => {
      const list = formArrayList({
        validators: [minTwoContacts],
        value: [{ name: 'rolster' }],
        valueToControls
      });

      expect(list.valid).toBe(false);
      expect(list.error?.id).toBe('minContacts');
    });
  });

  describe('push', () => {
    it('should notify a new list with the added controls', () => {
      const list = formArrayList({
        value: [{ name: 'rolster' }],
        valueToControls
      });

      const track = trackList(list);

      track.current.push(valueToControls({ name: 'react' }));

      expect(track.actions).toEqual(['list']);
      expect(track.current.value).toEqual([
        { name: 'rolster' },
        { name: 'react' }
      ]);
      expect(track.current.controlsUuid.length).toBe(2);
      expect(list.value).toEqual([{ name: 'rolster' }]);
    });
  });

  describe('remove', () => {
    it('should notify a new list without the given controls', () => {
      const list = formArrayList({
        value: [{ name: 'rolster' }, { name: 'react' }],
        valueToControls
      });

      const track = trackList(list);

      track.current.remove(track.current.controls[0]);

      expect(track.current.value).toEqual([{ name: 'react' }]);
      expect(track.current.controls.length).toBe(1);
      expect(track.current.controlsUuid.length).toBe(1);
    });
  });

  describe('setValue', () => {
    it('should rebuild the controls and mark the list as dirty', () => {
      const list = formArrayList({ valueToControls });

      const track = trackList(list);

      track.current.setValue([{ name: 'rolster' }, { name: 'react' }]);

      expect(track.current.value).toEqual([
        { name: 'rolster' },
        { name: 'react' }
      ]);
      expect(track.current.dirty).toBe(true);
      expect(track.current.controls.length).toBe(2);
    });
  });

  describe('reset', () => {
    it('should restore the default value of the list', () => {
      const list = formArrayList({
        value: [{ name: 'rolster' }],
        valueToControls
      });

      const track = trackList(list);

      track.current.setValue([{ name: 'react' }, { name: 'angular' }]);
      track.current.reset();

      expect(track.current.value).toEqual([{ name: 'rolster' }]);
      expect(track.current.dirty).toBe(false);
      expect(track.current.touched).toBe(false);
    });

    it('should restore the value defined with setDefaultValue', () => {
      const list = formArrayList({
        value: [{ name: 'rolster' }],
        valueToControls
      });

      const track = trackList(list);

      track.current.setDefaultValue([{ name: 'react' }]);
      track.current.setValue([{ name: 'angular' }]);
      track.current.reset();

      expect(track.current.value).toEqual([{ name: 'react' }]);
    });
  });

  describe('findControlsByUuid', () => {
    it('should find the controls using the uuid generated by valueToUuid', () => {
      const list = formArrayList({
        value: [{ name: 'rolster' }, { name: 'react' }],
        valueToControls,
        valueToUuid: ({ name }) => name
      });

      expect(list.findControlsByUuid('react')?.name.value).toBe('react');
      expect(list.findControlsByUuid('unknown')).toBeUndefined();
    });
  });

  describe('controls synchronization', () => {
    it('should update the list value when an inner control changes', () => {
      const list = formArrayList({
        value: [{ name: 'rolster' }],
        valueToControls
      });

      const track = trackList(list);

      track.current.controls[0].name.setValue('react');

      expect(track.actions).toEqual(['value']);
      expect(track.current.value).toEqual([{ name: 'react' }]);
    });
  });
});
