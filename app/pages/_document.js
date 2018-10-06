import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';

class YeepDocument extends Document {
  render() {
    return (
      <html lang="en">
        <Head>
          <meta name="viewport" content="initial-scale=1.0, width=device-width, shrink-to-fit=no" />
          {/* <link rel="stylesheet" href="/_next/static/style.css" /> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

export default YeepDocument;
