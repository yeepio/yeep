import { BehaviorSubject } from 'rxjs';

class SessionStore {
  constructor() {
    const cachedUser = localStorage.getItem('session.user');
    this.user$ = new BehaviorSubject(cachedUser ? JSON.parse(cachedUser) : {});
    this.isLoginPending$ = new BehaviorSubject(false);
  }

  login = ({ username, password }) => {
    console.log(`Mock login ${username}:${password}`);
    // show pending login indicator
    this.isLoginPending$.next(true);
    // mock login functionality
    setTimeout(() => {
      const user = {
        id: '507f191e810c19729de860ea',
        username: 'wile',
        fullName: 'Wile E. Coyote',
        picture: 'https://www.acme.com/pictures/coyote.png',
      };
      // update state
      this.user$.next(user);
      this.isLoginPending$.next(false);
      // cache user in local storage
      localStorage.setItem('session.user', JSON.stringify(user));
    }, 2000);
  };

  logout = () => {
    // clear state
    this.user$.next({});
    this.isLoginPending$.next(false);
    // clear cache
    localStorage.removeItem('session.user');
  };
}

export default SessionStore;
