import { BehaviorSubject } from 'rxjs';

class OrgStore {
  constructor() {
    /*
      In OrgEditPermissions Create, Update and Delete actions happen in modals.
      The currentModal$ observable takes 4 possible values:
      "" (empty string), "CREATE", "EDIT", "DELETE"
     */
    this.currentPermissionsModal$ = new BehaviorSubject('');
    /*
      Similarly for OrgEditRoles
     */
    this.currentRolesModal$ = new BehaviorSubject('');
  }

  // TODO: Add create***, edit***, delete*** methods for each entity needed

}

export default OrgStore;
