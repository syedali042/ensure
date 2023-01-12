import {useContext} from 'react';

import {GlobalContext} from '../../context/GlobalState';

import Loading from '../Reusable/Loading';
import Message from '../Reusable/Message';

const Entries = () => {
  const {entriesViewId} = useContext(GlobalContext);

  return (
    <>
      {entriesViewId ? (
        <iframe
          style={{width: '100%', height: '100%'}}
          title="Entries"
          src={`https://airtable.com/embed/${entriesViewId}?backgroundColor=yellow&viewControls=on`}
        />
      ) : (
        <>
          {entriesViewId === '' ? (
            <Message text="Ingen certifikater endnu!" />
          ) : (
            <Loading />
          )}
        </>
      )}
    </>
  );
};

export default Entries;
