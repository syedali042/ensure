import * as React from 'react';

import {ChakraProvider} from '@chakra-ui/react';

import {GlobalProvider} from './context/GlobalState';
// import Header from './components/Header';
import Body from './components/Body';
// import Footer from './components/Footer';

import './App.css';

function App() {
  console.log('Here')
  return (
    <GlobalProvider>
      <ChakraProvider>
        {/* <Header></Header> */}
        <Body></Body>
        {/* <Footer></Footer> */}
      </ChakraProvider>
    </GlobalProvider>
  );
}

export default App;
