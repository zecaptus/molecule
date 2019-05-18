import React from 'react';
import LeftSidebar from '../../components/LeftSidebar';

const operations = (Original, system) => props => {
  const tags = props.specSelectors.taggedOperations();

  const isRoutesShown = props.moleculeSelectors.isRoutesShown();
  const operation = props.molecule().get('operation');
  const OperationContainer = props.getComponent('OperationContainer', true);
  return (
    <div className="molecule-body">
      {isRoutesShown && <LeftSidebar tags={tags} {...props} />}
      {operation &&
        tags
          .map((tagObj, tag) => {
            return tagObj
              .get('operations')
              .map(op => {
                if (operation.op.get('id') === op.get('id')) {
                  const path = op.get('path');
                  const method = op.get('method');
                  const specPath = props.Im.List(['paths', path, method]);

                  return (
                    <OperationContainer
                      key={`${path}-${method}`}
                      specPath={specPath}
                      op={op}
                      path={path}
                      method={method}
                      tag={tag}
                    />
                  );
                }
                return null;
              })
              .toArray();
          })
          .toArray()}
    </div>
  );
};

export default operations;
