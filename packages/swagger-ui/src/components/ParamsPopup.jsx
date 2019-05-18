import React from 'react';

const ParamsPopup = props => {
  const { getComponent } = props;
  const ServersContainer = getComponent('ServersContainer', true);
  const SchemesContainer = getComponent('SchemesContainer', true);
  return (
    <div className="dialog-ux">
      <div className="backdrop-ux" />
      <div className="modal-ux">
        <div className="modal-dialog-ux">
          <div className="modal-ux-inner">
            <div className="modal-ux-header">
              <h3>Settings</h3>
              <button
                type="button"
                className="close-modal"
                onClick={props.onClose}
              >
                <svg width="20" height="20">
                  <use href="#close" xlinkHref="#close" />
                </svg>
              </button>
            </div>
            <div className="modal-ux-content settings">
              <ServersContainer />
              <SchemesContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParamsPopup;
