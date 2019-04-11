import { BehaviorSubject } from 'rxjs';

class RoleStore {
  constructor() {
    // The deleteModal$ observable takes 3 possible values:
    // "" (empty string), "DELETE", "DELETION_IN_PROGRESS"
    this.deleteModal$ = new BehaviorSubject('');
    // Useful flag to indicate user has changed the roles organization
    this.changedOrg$ = new BehaviorSubject(false);
    // Useful flag to indicate user has changed the roles permissions
    this.changedPermissions$ = new BehaviorSubject(false);
  }
}

export default RoleStore;