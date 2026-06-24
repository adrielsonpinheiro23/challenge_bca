import { uniqueName } from '../../utils/testData';

export function createEmployeeData() {
  return {
    employeeId: Date.now().toString().slice(-8),
    firstName: uniqueName('Auto'),
    lastName: 'Tester',
  };
}
