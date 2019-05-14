import React from 'react';
import SwaggerUI from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import './index.css';
import Topbar from './components/Topbar';
import OverwrittenComponents from './overwrittenComponents';
import Reducers from './reducers';
// Create the layout component
class OperationsLayout extends React.Component {
  render() {
    const { getComponent } = this.props;

    const Operations = getComponent('operations', true);

    return (
      <div>
        <Topbar />
        <Operations />
      </div>
    );
  }
}

// Create the plugin that provides our layout component
const OperationsLayoutPlugin = () => {
  return {
    components: {
      OperationsLayout: OperationsLayout,
    },
  };
};

// Provide the plugin to Swagger-UI, and select OperationsLayout
// as the layout for Swagger-UI
window.molecule = options =>
  SwaggerUI({
    dom_id: '#root',
    url: 'https://petstore.swagger.io/v2/swagger.json',
    plugins: [OperationsLayoutPlugin, OverwrittenComponents, Reducers],
    layout: 'OperationsLayout',
    ...options,
  });
