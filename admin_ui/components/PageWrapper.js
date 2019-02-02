import React from 'react';

/**
 * Wrapper for all pages, shows on the right of the Nav
 */
const PageWrapper = () => {
  return (
    <div className="leading-normal p-4 sm:p-8">
      <h1>Heading</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos doloremque doloribus,
        earum error harum ipsa ipsum itaque minus nemo nihil odio omnis, perspiciatis quae quas
        quasi quidem repudiandae sed tempore!
      </p>
      <p>
        Let{"'"}s checkout our default link colours: <a href="/">Go back to your dashboard</a>
      </p>
    </div>
  );
};

export default PageWrapper;
