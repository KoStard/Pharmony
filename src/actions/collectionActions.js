export const createCollectionActionCreator = dispatch => (
  name,
  description
) => {
  return dispatch({
    type: 'CREATE_COLLECTION',
    name: name,
    description: description
  });
};
export const removeCollectionActionCreator = dispatch => name => {
  return dispatch({
    type: 'REMOVE_COLLECTION',
    name: name
  });
};
