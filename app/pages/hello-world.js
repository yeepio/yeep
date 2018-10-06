import React from 'react';
import Head from 'next/head';

class HelloWorld extends React.Component {
  render() {
    return (
      <div>
        <Head>
          <title>Yo Yeep</title>
        </Head>
        <h1>Hello world!</h1>
      </div>
    );
  }
}

export default HelloWorld;
