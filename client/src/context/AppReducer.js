const Reducer = (state, action) => {
  switch (action.type) {
    case 'RESTORE_DEFAULT_STATE':
      return {
        ...state,
        ...action.payload,
      };
    case 'UPDATE_VALUES':
      return {
        ...state,
        values: action.payload,
      };
    case 'TOGGLE_NAV_EXPANDED':
      return {
        ...state,
        navExpanded: action.payload,
      };
    case 'UPDATE_TOKEN':
      return {
        ...state,
        token: action.payload,
      };
    case 'UPDATE_AGENT_ID':
      return {
        ...state,
        agentId: action.payload,
      };
    case 'UPDATE_AGENT':
      return {
        ...state,
        agent: action.payload,
      };
    case 'UPDATE_SECTION_TO_SHOW':
      return {
        ...state,
        section: action.payload,
      };
    case `UPDATE_LEASERS`:
      return {
        ...state,
        leasers: action.payload,
      };
    case 'UPDATE_ENTRIES_VIEW_ID':
      return {
        ...state,
        entriesViewId: action.payload,
      };
    case 'SET_TOAST':
      return {
        ...state,
        toast: action.payload,
      };
    default:
      return state;
  }
};

export default Reducer;
