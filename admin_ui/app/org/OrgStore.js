import { BehaviorSubject } from 'rxjs';

class OrgStore {
  constructor() {
    // Potential values: empty string, "create", "edit", "delete"
    this.currentModal$ = new BehaviorSubject('');
  }

  // TODO: Add create***, edit***, delete*** methods for each entity needed

}

export default OrgStore;
