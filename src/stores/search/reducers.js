import {
  DELETE_HISTORY_FAILED,
  DELETE_HISTORY_REQUEST,
  DELETE_HISTORY_SUCCESS,
  SEARCH_FAILED,
  SEARCH_HISTORY_FAILED,
  SEARCH_HISTORY_REQUEST,
  SEARCH_HISTORY_SUCCESS,
  SEARCH_POST_HISTORY_SUCCESS,
  SEARCH_REQUEST,
  SEARCH_SUCCESS,
} from "./types";

const initialState = {
  search: [],
  historySearch: [],
  error: null,
};

const handleError = (state, actionType, error) => {
  return {
    ...state,
    loading: false,
    error: error,
  };
};

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case SEARCH_REQUEST:
    case SEARCH_HISTORY_REQUEST:
    case DELETE_HISTORY_REQUEST:
      return { ...state, loading: true };

    case SEARCH_SUCCESS:
      const listSearch = action.payload;
      const updatedSearch = [];
      listSearch.forEach((searchItem) => {
        updatedSearch.push(searchItem);
      });

      return {
        ...state,
        search: updatedSearch,
      };

    case SEARCH_POST_HISTORY_SUCCESS:
      const { result } = action.payload;
      const isInHistory = state.historySearch.some(
        (historyItem) => historyItem._id === result._id
      );

      if (!isInHistory) {
        return {
          ...state,
          loading: false,
          historySearch: [...state.historySearch, result],
        };
      }
      return {
        ...state,
        loading: false,
      };

    case SEARCH_HISTORY_SUCCESS:
      const { historySearch } = state;
      const newAddresses = action.payload;

      const updatedHistorySearch = newAddresses.reduce(
        (acc, newAddress) => {
          const existingIndex = acc.findIndex(
            (existing) => existing._id === newAddress._id
          );

          if (existingIndex !== -1) {
            acc[existingIndex] = newAddress;
          } else {
            acc.push(newAddress);
          }

          return acc;
        },
        [...historySearch]
      ); 

      return {
        ...state,
        loading: false,
        historySearch: updatedHistorySearch,
      };

    case DELETE_HISTORY_SUCCESS:
      return {
        ...state,
        loading: false,
        historySearch: [],
      };
    case SEARCH_FAILED:
    case SEARCH_HISTORY_FAILED:
    case DELETE_HISTORY_FAILED:
      return handleError(state, action.type, action.payload);

    default:
      return initialState;
  }
};

export default searchReducer;
