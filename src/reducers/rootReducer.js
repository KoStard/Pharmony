const initState = {
  collections: [
    {
      id: 1,
      name: 'Surgery',
      description: 'Some description here for Surgery',
      blocks: [
        { name: 'Some name', description: 'Some description' },
        { name: 'Some name2', description: 'Some description' },
        { name: 'Some name3', description: 'Some description' },
        { name: 'Some name4', description: 'Some description' },
        { name: 'Some name5', description: 'Some description' }
      ]
    },
    {
      id: 2,
      name: 'Gynecology',
      description: 'Some description here for Gynecology',
      blocks: []
    }
  ],
  currentPosition: {
    position: 'MENU', // MENU, COLLECTION
    additional: {}
  }
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
    case 'CHANGE_POSITION':
      return {
        ...state,
        currentPosition: {
          position: action.newPosition.position,
          additional: action.newPosition.additional
            ? { ...action.newPosition.additional }
            : {}
        }
      };
  }
  return state;
};

export default rootReducer;
