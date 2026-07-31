import { useFormControl } from './form-control/form-control';
import { useFormGroup } from './form-group/form-group';
import { reduceControlsToValues, reduceGroupToValues } from './helpers';
import { renderHook } from './testing';

describe('reduceControlsToValues', () => {
  it('should reduce the controls to an array of values', () => {
    const { result } = renderHook(() => {
      const name = useFormControl('rolster');
      const language = useFormControl('typescript');

      return { language, name };
    });

    expect(
      reduceControlsToValues({
        language: result.current.language,
        name: result.current.name
      })
    ).toEqual(['typescript', 'rolster']);
  });
});

describe('reduceGroupToValues', () => {
  it('should reduce the controls of a group to an array of values', () => {
    const { result } = renderHook(() => {
      const name = useFormControl('rolster');
      const language = useFormControl('typescript');

      return useFormGroup({ language, name });
    });

    expect(reduceGroupToValues(result.current)).toEqual([
      'typescript',
      'rolster'
    ]);
  });
});
