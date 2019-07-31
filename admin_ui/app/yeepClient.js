import YeepClient from '@yeep/client';
import { store } from './appStore';
import { navigate } from '@reach/router';
import { resolveLogout } from './session/sessionStore';

const yeepClient = new YeepClient({
  baseURL: 'http://localhost:5000',
  // baseURL: process.env.API_BASE_URL,
  onError: (err) => {
    switch (err.code) {
      case 10012: {
        // AuthorizationError
        store.dispatch(resolveLogout());
        navigate('/login');
        break;
      }
    }
  },
});

export default yeepClient;
