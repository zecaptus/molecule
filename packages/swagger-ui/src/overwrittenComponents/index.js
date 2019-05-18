import operations from './Operations';
import React from 'react';

export default function(system) {
  return {
    wrapComponents: {
      operations,
      OperationSummary: (Original, system) => props => {
        return <Original {...props} toggleShown={() => {}} />;
      },
      authorizeBtn: () => props => {
        let { isAuthorized, showPopup, onClick, getComponent } = props;

        //must be moved out of button component
        const AuthorizationPopup = getComponent('authorizationPopup', true);

        return (
          <div className={`auth-wrapper${isAuthorized ? ' active' : ''}`}>
            <div onClick={onClick}>
              <svg width="26" height="26">
                <use
                  href={isAuthorized ? '#locked' : '#unlocked'}
                  xlinkHref={isAuthorized ? '#locked' : '#unlocked'}
                />
              </svg>
            </div>
            {showPopup && <AuthorizationPopup />}
          </div>
        );
      },
    },
  };
}
