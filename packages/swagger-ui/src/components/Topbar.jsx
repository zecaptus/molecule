import React from 'react';
import logo from '../logo.svg';

function Topbar() {
  return (
    <div className="Topbar">
      <img src={logo} alt="logo" height={48} />
      Molecule - Swagger UI
    </div>
  );
}

export default Topbar;
