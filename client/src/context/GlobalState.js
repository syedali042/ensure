import {createContext, useReducer} from 'react';
import AppReducer from './AppReducer';
import jwt from 'jsonwebtoken';

const sectionDefaultValue = 'Din Profil';

const defaultState = {
  navExpanded: true,
  token: '',
  agentId: '',
  // token:
  //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InJlY3RuY0pGMVVpaTlUWE1zIiwiZGF0ZSI6IjIwMjEtMTEtMzBUMTQ6MTM6MTIuMDAwWiIsInR5cGUiOiJhZ2VudCIsImlhdCI6MTYzODM2NzI5NH0.cjnHSUDkJXxqSvNiiXuc8DVgYc50ZQYGpSGy6saAo4Q',
  // agentId: 'rectncJF1Uii9TXMs',
  agent: {},
  section: sectionDefaultValue,
  leasers: undefined,
  entriesViewId: undefined,
  toast: {},
};
// Initial State
const initialState = {values: {}, ...defaultState};

// Create Context
export const GlobalContext = createContext(initialState);

// Provider
export const GlobalProvider = ({children}) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  //Actions
  const restoreDefaultState = () => {
    dispatch({type: 'RESTORE_DEFAULT_STATE', payload: defaultState});
  };

  const updateValues = (values) => {
    dispatch({type: 'UPDATE_VALUES', payload: values});
  };

  const logoutClear = () => {
    restoreDefaultState();
    localStorage.setItem('ensureToken', '');
  };

  const toggleNavExpanded = () => {
    dispatch({type: 'TOGGLE_NAV_EXPANDED', payload: !state.navExpanded});
  };

  const updateTokenAndAgentId = (token) => {
    let agentId;
    if (token) {
      const tokenObj = jwt.decode(token);
      agentId = `${tokenObj.id}`;
    } else agentId = '';
    dispatch({type: 'UPDATE_AGENT_ID', payload: agentId});

    dispatch({type: 'UPDATE_TOKEN', payload: token});
    localStorage.setItem('ensureToken', token);
  };

  const updateAgent = (values) => {
    dispatch({type: 'UPDATE_AGENT', payload: values});
  };

  const updateSection = (values) => {
    dispatch({type: 'UPDATE_SECTION_TO_SHOW', payload: values});
  };

  const updateLeasers = (values) => {
    dispatch({type: 'UPDATE_LEASERS', payload: values});
  };

  const updateEntriesViewId = (values) => {
    dispatch({type: 'UPDATE_ENTRIES_VIEW_ID', payload: values});
  };

  const setToast = (values) => {
    dispatch({type: 'SET_TOAST', payload: values});

    setTimeout(() => {
      dispatch({type: 'SET_TOAST', payload: {}});
    });
  };

  return (
    <GlobalContext.Provider
      value={{
        values: state.values,
        navExpanded: state.navExpanded,
        token: state.token,
        agentId: state.agentId,
        agent: state.agent,
        section: state.section,
        leasers: state.leasers,
        entriesViewId: state.entriesViewId,
        toast: state.toast,

        updateValues,
        logoutClear,
        toggleNavExpanded,
        updateTokenAndAgentId,
        updateAgent,
        updateSection,
        updateLeasers,
        updateEntriesViewId,
        setToast,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
