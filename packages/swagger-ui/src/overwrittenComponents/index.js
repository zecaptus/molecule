import operations from './Operations';
import React from 'react';

export default function(system) {
  return {
    wrapComponents: {
      operations,
      OperationSummary: (Original, system) => props => {
        console.log('summary');
        return <Original {...props} toggleShown={() => {}} />;
      },
      operationContainer: (Original, system) => props => {
        console.log(props);
        return (
          <div>
            <Original {...props} />
          </div>
        );
      },
    },
  };
}
