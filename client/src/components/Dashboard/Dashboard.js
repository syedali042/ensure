import {useContext, useEffect} from 'react';

import {GlobalContext} from '../../context/GlobalState';

import User from './User';
import Leasers from './Leasers';
import Entries from './Entries';
import Codes from './Codes';
import axios from 'axios';

const Dashboard = () => {
  const {
    values,
    agentId,
    token,
    section,
    updateAgent,
    updateLeasers,
    updateEntriesViewId,
  } = useContext(GlobalContext);

  useEffect(() => {
    const getAgent = async () => {
      try {
        const valuesRes = await axios.get(`/api/agents/${agentId}`, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });
        const results = valuesRes.data;

        updateAgent(results.agent);
        const agentsF = values.fields.agents.fields;
        if (results.agent[agentsF.entriesViewId.api])
          updateEntriesViewId(results.agent[agentsF.entriesViewId.api]);
        else updateEntriesViewId('');
      } catch (err) {
        console.dir(err.response, {depth: null});
      }
    };

    const getLeasers = async () => {
      try {
        const valuesRes = await axios.get(`/api/leasers/all`, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });
        const results = valuesRes.data;
        if (results.leasers.length > 0) updateLeasers(results.leasers);
        else updateLeasers([]);
      } catch (err) {
        console.dir(err.response, {depth: null});
      }
    };

    getAgent();
    getLeasers();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      {section === values.g.sectionsTitles.user ? (
        <User />
      ) : section === values.g.sectionsTitles.leasers ? (
        <Leasers />
      ) : section === values.g.sectionsTitles.entries ? (
        <Entries />
      ) : section === values.g.sectionsTitles.codes ? (
        <>
          <Codes />
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Dashboard;
