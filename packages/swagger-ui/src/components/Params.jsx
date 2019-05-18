import React from 'react';
import ParamsIcon from '../assets/Params';
import ParamsPopup from './ParamsPopup';

const Params = props => {
  const isShown = props.moleculeSelectors.isSettingsShown();
  const { showSettings } = props.moleculeActions;

  return (
    <div className="Params">
      <div onClick={() => showSettings(true)}>
        <ParamsIcon />
      </div>

      {isShown && (
        <ParamsPopup {...props} onClose={() => showSettings(false)} />
      )}
    </div>
  );
};

export default Params;
