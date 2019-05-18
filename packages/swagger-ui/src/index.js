import React from 'react';
import SwaggerUI from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import './index.css';
import ParamsComponent from './components/Params';
import Route from './assets/Route';
import OverwrittenComponents from './overwrittenComponents';
import Reducers from './reducers';
// Create the layout component
class OperationsLayout extends React.Component {
  render() {
    const { getComponent, moleculeSelectors, moleculeActions } = this.props;

    const AuthorizeBtnContainer = getComponent('AuthorizeBtnContainer', true);
    const Operations = getComponent('operations', true);
    const Params = getComponent('Params', true);

    const isRoutesShown = moleculeSelectors.isRoutesShown();
    const { showRoutes } = moleculeActions;

    return (
      <div className="layout">
        {/* <Topbar {...this.props} /> */}
        <div className="params">
          <div className="actions_list">
            <div
              className={`${isRoutesShown ? 'active' : ''}`}
              onClick={() => showRoutes(!isRoutesShown)}
            >
              <Route />
            </div>
            <AuthorizeBtnContainer />
          </div>
          <Params />
        </div>
        <Operations />
      </div>
    );
  }
}

// Create the plugin that provides our layout component
const MoleculePlugin = () => {
  return {
    components: {
      OperationsLayout: OperationsLayout,
      Params: ParamsComponent,
    },
  };
};

// Provide the plugin to Swagger-UI, and select OperationsLayout
// as the layout for Swagger-UI
window.molecule = options =>
  SwaggerUI({
    dom_id: '#root',
    url:
      'https://gist.githubusercontent.com/danielflower/5c5ae8a46a0a49aee508690c19b33ada/raw/b06ff4d9764b5800424f6a21a40158c35277ee65/petstore.json',
    //url: 'https://petstore.swagger.io/v2/swagger.json',
    plugins: [MoleculePlugin, OverwrittenComponents, Reducers],
    layout: 'OperationsLayout',
    ...options,
  });
