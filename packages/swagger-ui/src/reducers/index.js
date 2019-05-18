export default function(system) {
  return {
    statePlugins: {
      molecule: {
        reducers: {
          SHOW_ROUTES: (state, action) => {
            return state.set('routes_shown', action.payload);
          },
          SHOW_SETTINGS: (state, action) => {
            return state.set('settings_shown', action.payload);
          },
          SET_OPERATION: (state, action) => {
            return state.set('operation', action.payload);
          },
        },
        selectors: {
          isSettingsShown: state => state.get('settings_shown'),
          isRoutesShown: state => state.get('routes_shown'),
        },
        actions: {
          showSettings: visible => ({
            type: 'SHOW_SETTINGS',
            payload: visible,
          }),
          showRoutes: visible => ({
            type: 'SHOW_ROUTES',
            payload: visible,
          }),
        },
      },
    },
    afterLoad: system => {
      system.moleculeActions.showRoutes(true);
    },
  };
}
