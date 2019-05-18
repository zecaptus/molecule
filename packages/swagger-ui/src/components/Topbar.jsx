import React from 'react';
import logo from '../logo.svg';
import Swagger from '../assets/Swagger';

function Topbar(props) {
  const { specSelectors } = props;

  const info = specSelectors.info();

  const title = info.get('title');
  const version = info.get('version');
  return (
    <div className="Topbar">
      <Swagger style={{ padding: 8 }} />
      <div>
        <span className="topbar-title">{title}</span>
        <span className="topbar-version">{version}</span>
      </div>
    </div>
  );
}

export default Topbar;
