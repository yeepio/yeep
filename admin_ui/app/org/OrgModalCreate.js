import React, { useContext } from 'react';
import { useObservable } from 'rxjs-hooks';
import Store from '../Store';
import Modal from '../../components/Modal';

const OrgModalCreate = () => {
  // Load the store
  const store = useContext(Store);
  const currentModal = useObservable(
    () => store.org.currentModal$,
    store.org.currentModal$.getValue()
  );

  if (currentModal === 'CREATE') {
    return (
      <Modal onClose={() => store.org.currentModal$.next('')}>
        Hello I amm the create modal!!!!
      </Modal>
    );
  }
  return null;
};

/*OrgModalCreate.propTypes = {
  
};*/

export default OrgModalCreate;
