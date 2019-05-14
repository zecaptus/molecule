export default function(system) {
  return {
    statePlugins: {
      molecule: {
        reducers: {
          SET_OPERATION: (state, action) => {
            // you're only working with the state under the namespace, in this case "example".
            // So you can do what you want, without worrying about /other/ namespaces
            return state.set('operation', action.payload);
          },
        },
      },
    },
  };
}
