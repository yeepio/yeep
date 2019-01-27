import React from 'react';
import './main.css';
import Navbar from '../components/Navbar';

const App = () => {
  return (
    <div>
      <Navbar elevated />
      <h1 className="text-red">Hello world!</h1>
    </div>
  );
};

export default App;
