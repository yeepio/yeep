import { BehaviorSubject } from 'rxjs';

class SessionStore {
  constructor() {
    const cachedUser = localStorage.getItem('session.user');
    this.user$ = new BehaviorSubject(cachedUser ? JSON.parse(cachedUser) : {});
  }

  login = ({ username, password }) => {
    console.log(`Mock login ${username}:${password}`);
    // mock login functionality
    Promise.resolve(() => {
      const user = {
        id: '507f191e810c19729de860ea',
        username: 'wile',
        fullName: 'Wile E. Coyote',
        picture: 'https://www.acme.com/pictures/coyote.png',
      };
      // update state
      this.user$.next(user);
      // cache user in local storage
      localStorage.setItem('session.user', JSON.stringify(user));
    });
  };

  logout = () => {
    // clear state
    this.user$.next({});
    // clear cache
    localStorage.removeItem('session.user');
  };
}

export default SessionStore;
