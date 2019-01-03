export const changePositionActionCreator = dispatch => newPosition => {
  return dispatch({
    type: 'CHANGE_POSITION',
    newPosition: newPosition
  });
};

export const changePositionToCollectionActionCreator = dispatch => collection_name => {
  return changePositionActionCreator(dispatch)({
    position: 'COLLECTION',
    additional: {
      collection_name: collection_name
    }
  });
};
