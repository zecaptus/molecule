import React from 'react';

function LeftSidebar(props) {
  const Collapse = props.getComponent('Collapse');

  const { docExpansion } = props.getConfigs();

  return (
    <aside className="LeftSidebar">
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
                      const { deprecated, operationId } = op
                        .get('operation')
                        .toJS();
                      const path = op.get('path');
                      const method = op.get('method');
                      return (
                        <div
                          className={`opblock${
                            deprecated ? ' opblock-deprecated' : ''
                          } opblock-${method} Path`}
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
