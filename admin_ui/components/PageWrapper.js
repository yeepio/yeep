import React from 'react';

/**
 * Wrapper for all pages, shows on the right of the Nav
 */
const PageWrapper = () => {
  return (
    <div className="leading-normal p-4 sm:p-8 yeep-text">
      <h1>Welcome to the Kitchen Sink</h1>
      <p>
        The aim of this page is to <strong>showcase all the various UI elements</strong> we plan to
        use in our app.
        <br />
        The default link colour is blue: <a href="/">Example link</a>
      </p>
      <h2>The &quot;Thumb&quot; principle</h2>
      <p>
        This will be a responsive app so we try to ensure that (with the possible exception of
        inline links!) any tappable area has a height of at least 40 pixels. This means that{' '}
        <code>&lt;input&gt;</code> fields, <code>&lt;select&gt;</code> elements, buttons will have
        that specific height.
      </p>
      <h2>Button styles (this is an H2 subheading)</h2>
      <p>
        Default button styling: <code>.btn</code> class applied to a <code>&lt;button&gt;</code>{' '}
        element:
      </p>
      <p>
        <button className="btn">I&lsquo;m a button</button>
      </p>
      <p>
        <code>.btn</code> can also be applied to <code>&lt;a&gt;</code> tags:
      </p>
      <p>
        <a href="/" className="btn">
          I am actually a link
        </a>
      </p>
      <h2>Secondary buttons</h2>
      <p>
        <button className="btn-secondary">Secondary button</button>
      </p>
      <h2>Form elements</h2>
      <p>
        A <code>&lt;fieldset&gt;</code> will be used to wrap labels and their form elements in most
        cases:
      </p>
      <fieldset>
        <legend>legend text here</legend>
        <p>For the majority of our forms we need a horizontal label+field layout. Copying Bootstrap&rsquo;s approach we&rsquo;ll use a <code>&lt;div.form-group&gt;</code> to wrap all label+field pairs:</p>
        <div className="form-group">
          <label htmlFor="tempTextField">The label:</label>
          <input id="tempTextField" type="text" placeholder="The text field"/>
        </div>
      </fieldset>
    </div>
  );
};

export default PageWrapper;
