import { BehaviorSubject } from 'rxjs';

class OrgStore {
  constructor() {
    // The modal currently being displayed
    // "" (empty string) by default or any of the constants imported from modalTypesjs
    this.displayedModal$ = new BehaviorSubject('');
  }

}

export default OrgStore;
