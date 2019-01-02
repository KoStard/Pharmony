const initState = {
  collections: [
    {
      id: 1,
      name: 'Surgery',
      description: 'Some description here for Surgery'
    },
    {
      id: 2,
      name: 'Gynecology',
      description: 'Some description here for Gynecology'
    }
  ]
};

const rootReducer = (state = initState, action) => {
  switch (action.type) {
    case 'CREATE_COLLECTION':
      if (
        action.name &&
        !state.collections.some(collection => collection.name == action.name)
      ) {
        let id =
          Math.max(state.collections.map(collection => collection.id)) + 1;
        return {
          ...state,
          collections: [
            ...state.collections,
            {
              id: id,
              name: action.name,
              description: action.description
            }
          ]
        };
      }
      break;
    case 'REMOVE_COLLECTION':
      if (action.name) {
        console.log('The new state will be', {
          ...state,
          collections: [
            state.collections.filter(
              collection => collection.name != action.name
            )
          ]
        });
        return {
          ...state,
          collections: state.collections.filter(
            collection => collection.name != action.name
          )
        };
      }
      break;
  }
  return state;
};

export default rootReducer;
