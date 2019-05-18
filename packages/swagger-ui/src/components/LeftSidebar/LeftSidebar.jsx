import React from 'react';
import { helpers } from 'swagger-client';

const { opId } = helpers;

function LeftSidebar(props) {
  const Collapse = props.getComponent('Collapse');

  const { docExpansion } = props.getConfigs();
  let currentOp = props.molecule().get('operation');
  let currentOperationId = null;

  if (currentOp) {
    currentOp = currentOp.op;
    currentOperationId =
      currentOp.getIn(['operation', '__originalOperationId']) ||
      currentOp.getIn(['operation', 'operationId']) ||
      opId(
        currentOp.get('operation'),
        currentOp.get('path'),
        currentOp.get('method'),
      ) ||
      currentOp.get('id');
  }

  const info = props.specSelectors.info();

  const title = info.get('title');
  const version = info.get('version');

  return (
    <aside className="LeftSidebar">
      <div className="sb-info">
        <span className="topbar-title">{title}</span>
        <span className="topbar-version">{version}</span>
      </div>
      {props.tags
        .map((tagObj, tag) => {
          const isShownKey = ['operations-tag', tag];
          const showTag = props.layoutSelectors.isShown(
            isShownKey,
            docExpansion === 'full' || docExpansion === 'list',
          );
          return (
            <section key={tag}>
              <div
                className={`Tag${showTag ? ' active' : ''}`}
                onClick={() => props.layoutActions.show(isShownKey, !showTag)}
              >
                <span>{tag}</span>
                <span>{tagObj.getIn(['tagDetails', 'description'], null)}</span>
              </div>
              <Collapse isOpened={showTag}>
                <section className="Paths">
                  {tagObj
                    .get('operations')
                    .map(op => {
                      const { deprecated } = op.get('operation').toJS();
                      const path = op.get('path');
                      const method = op.get('method');
                      const operationId =
                        op.getIn(['operation', '__originalOperationId']) ||
                        op.getIn(['operation', 'operationId']) ||
                        opId(op.get('operation'), path, method) ||
                        op.get('id');
                      return (
                        <div
                          className={`opblock${
                            deprecated ? ' opblock-deprecated' : ''
                          } opblock-${method} Path${
                            currentOperationId === operationId
                              ? ' active'
                              : ' inactive'
                          }`}
                          key={`${path}-${method}`}
                          onClick={() => {
                            props.layoutActions.show(
                              ['operations', tag, operationId],
                              true,
                            );
                            props.dispatch({
                              type: 'SET_OPERATION',
                              payload: {
                                op,
                                path,
                                method,
                                tag,
                                specPath: props.Im.List([
                                  'paths',
                                  path,
                                  method,
                                ]),
                              },
                            });
                          }}
                        >
                          <span>{path}</span>
                          <span className="opblock-summary-method">
                            {method}
                          </span>
                        </div>
                      );
                    })
                    .toArray()}
                </section>
              </Collapse>
            </section>
          );
        })
        .toArray()}
    </aside>
  );
}

export default LeftSidebar;
