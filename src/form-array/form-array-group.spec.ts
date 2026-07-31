import { ValidatorGroupFn } from '@rolster/forms';
import { ValidatorFn } from '@rolster/validators';
import { formArrayControl } from './form-array-control';
import { ReactArrayAction } from './form-array-control.type';
import { formArrayGroup } from './form-array-group';
import { ReactArrayGroup } from './form-array-group.type';

const required: ValidatorFn<string> = (value) =>
  value ? undefined : { id: 'required', message: 'Value is required' };

interface GroupTrack<C extends Record<string, any>, R> {
  actions: ReactArrayAction[];
  current: ReactArrayGroup<C, R>;
}

function trackGroup<C extends Record<string, any>, R = any>(
  group: ReactArrayGroup<C, R>
): GroupTrack<C, R> {
  const track: GroupTrack<C, R> = { actions: [], current: group };

  const listen = (group: ReactArrayGroup<C, R>) => {
    group.subscribe((action, nextGroup) => {
      track.actions.push(action);
      track.current = nextGroup;

      listen(nextGroup);
    });
  };

  listen(group);

  return track;
}

describe('formArrayGroup', () => {
  describe('initial state', () => {
    it('should aggregate the value of its controls', () => {
      const group = formArrayGroup({
        controls: {
          language: formArrayControl('typescript'),
          name: formArrayControl('rolster')
        }
      });

      expect(group.uuid).toBeDefined();
      expect(group.value).toEqual({ language: 'typescript', name: 'rolster' });
      expect(group.dirty).toBe(false);
      expect(group.touched).toBe(false);
      expect(group.valid).toBe(true);
      expect(group.wrong).toBe(false);
    });

    it('should use the given uuid when it is provided', () => {
      const group = formArrayGroup({
        controls: { name: formArrayControl('rolster') },
        uuid: 'group-uuid'
      });

      expect(group.uuid).toBe('group-uuid');
    });

    it('should be invalid when some control is invalid', () => {
      const group = formArrayGroup({
        controls: { name: formArrayControl('', [required]) }
      });

      expect(group.valid).toBe(false);
      expect(group.invalid).toBe(true);
    });

    it('should store the given resource', () => {
      const group = formArrayGroup({
        controls: { name: formArrayControl('rolster') },
        resource: { id: 10 }
      });

      expect(group.resource).toEqual({ id: 10 });
    });
  });

  describe('controls synchronization', () => {
    it('should notify a new group when a control value changes', () => {
      const group = formArrayGroup({
        controls: { name: formArrayControl<string>('', [required]) }
      });

      const track = trackGroup(group);

      track.current.controls.name.setValue('rolster');

      expect(track.actions).toEqual(['value']);
      expect(track.current.value).toEqual({ name: 'rolster' });
      expect(track.current.dirty).toBe(true);
      expect(track.current.valid).toBe(true);
      expect(track.current).not.toBe(group);
      expect(group.value).toEqual({ name: '' });
    });

    it('should notify a new touched group when a control is touched', () => {
      const group = formArrayGroup({
        controls: { name: formArrayControl('rolster') }
      });

      const track = trackGroup(group);

      track.current.controls.name.touch();

      expect(track.actions).toEqual(['touched']);
      expect(track.current.touched).toBe(true);
      expect(track.current.toucheds).toBe(true);
    });
  });

  describe('group validators', () => {
    it('should evaluate validators over all the controls', () => {
      const nameNotEqualLanguage: ValidatorGroupFn<{
        language: ReturnType<typeof formArrayControl<string>>;
        name: ReturnType<typeof formArrayControl<string>>;
      }> = ({ language, name }) =>
        name.value !== language.value
          ? undefined
          : { id: 'nameNotEqualLanguage', message: 'Values are equals' };

      const group = formArrayGroup({
        controls: {
          language: formArrayControl('typescript'),
          name: formArrayControl('typescript')
        },
        validators: [nameNotEqualLanguage]
      });

      expect(group.valid).toBe(false);
      expect(group.error?.id).toBe('nameNotEqualLanguage');
    });

    it('should revalidate the controls with setValidators', () => {
      const group = formArrayGroup({
        controls: { name: formArrayControl('') }
      });

      const track = trackGroup(group);

      const nameRequired: ValidatorGroupFn<{
        name: ReturnType<typeof formArrayControl<string>>;
      }> = ({ name }) =>
        name.value
          ? undefined
          : { id: 'nameRequired', message: 'Name is required' };

      track.current.setValidators([nameRequired]);

      expect(track.actions).toEqual(['validators']);
      expect(track.current.errors[0]?.id).toBe('nameRequired');
    });
  });

  describe('setResource', () => {
    it('should notify a new group with the given resource', () => {
      const group = formArrayGroup<
        { name: ReturnType<typeof formArrayControl<string>> },
        { id: number }
      >({
        controls: { name: formArrayControl('rolster') }
      });

      const track = trackGroup(group);

      track.current.setResource({ id: 10 });

      expect(track.actions).toEqual(['resource']);
      expect(track.current.resource).toEqual({ id: 10 });
    });
  });

  describe('reset', () => {
    it('should restore the state of all its controls', () => {
      const group = formArrayGroup({
        controls: { name: formArrayControl('rolster') }
      });

      const track = trackGroup(group);

      track.current.controls.name.setValue('react');
      track.current.reset();

      expect(track.current.value).toEqual({ name: 'rolster' });
      expect(track.current.dirty).toBe(false);
      expect(track.current.touched).toBe(false);
    });
  });
});
