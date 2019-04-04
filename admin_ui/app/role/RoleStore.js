import { BehaviorSubject } from 'rxjs';

class RoleStore {
  constructor() {
    /*
      The deleteModal$ observable takes 3 possible values:
      "" (empty string), "DELETE", "DELETION_IN_PROGRESS"
     */
    this.deleteModal$ = new BehaviorSubject('');
  }
}

export default RoleStore;