import { uniqueName } from '../../utils/testData';

export function createEmployeeData() {
  return {
    firstName: uniqueName('Auto'),
    lastName: 'Tester',
  };
}
