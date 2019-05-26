import { BehaviorSubject } from 'rxjs';
import noop from 'lodash/noop';

class PermissionDeleteModalStore {
  constructor() {
    this.id$ = new BehaviorSubject('');
    this.name$ = new BehaviorSubject('');
    this.onSubmit = noop;
    this.onCancel = noop;
  }

  open = ({ id, name, onSubmit = noop, onCancel = noop }) => {
    this.id$.next(id);
    this.name$.next(name);
    this.onSubmit = onSubmit;
    this.onCancel = onCancel;
  };

  close = () => {
    this.id$.next('');
    this.name$.next('');
    this.onSubmit = noop;
    this.onCancel = noop;
  };

  deletePermission = ({ id }) => {
    console.log(`Deleting permission ${id}`);
    return new Promise((resolve, reject) => {
      // Fake async
      setTimeout(() => {
        console.log(`Deleted permission ${id}`);
        resolve();
      }, 2000);
    });
  };
}

export default PermissionDeleteModalStore;
