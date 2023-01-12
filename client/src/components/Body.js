import {useContext, useEffect, useState} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import axios from 'axios';
import {Flex} from '@chakra-ui/react';
import utilGeneral from 'util992/functions/general';
import {GlobalContext} from '../context/GlobalState';

import Login from './Login/Login';
import Dashboard from './Dashboard/Dashboard';
import SideBar from './SideBar/SideBar';
import Loading from './Reusable/Loading';
import Emails from './Reusable/Emails';

const Body = () => {
  const {values, agentId, updateValues, updateTokenAndAgentId, logoutClear} =
    useContext(GlobalContext);

  axios.interceptors.response.use(
    function (successRes) {
      return successRes;
    },
    function (error) {
      if (error.response.data.code === 401) logoutClear();

      return Promise.reject(error);
    }
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getValues = async () => {
      const valuesRes = await axios.get('/helper/values');
      const results = valuesRes.data;
      updateValues(results);
    };

    const tokenLocal = localStorage.getItem('ensureToken');
    if (tokenLocal) {
      updateTokenAndAgentId(tokenLocal);
    }

    getValues();
    setLoading(false);

    // eslint-disable-next-line
  }, [agentId]);

  return (
    <>
      {loading ? (
        <></>
      ) : (
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                agentId ? (
                  <>
                    {!utilGeneral.isEmptyObject(values) ? (
                      <Flex
                        flexDir="row"
                        maxH="98vh"
                        w="100%"
                        mt="1vh"
                        mb="1vh"
                      >
                        <SideBar />
                        <Flex mx="2" w="100%">
                          <Dashboard />
                        </Flex>
                      </Flex>
                    ) : (
                      <Loading />
                    )}
                  </>
                ) : (
                  // Get token and agentId from local storage
                  <Navigate to="login" replace={true} />
                )
              }
            ></Route>
            <Route
              path="resend-email/:type/:recordId"
              element={<Emails></Emails>}
            ></Route>
            <Route path="login" element={<Login></Login>}></Route>
          </Routes>
        </Router>
      )}
    </>
  );
};

export default Body;
