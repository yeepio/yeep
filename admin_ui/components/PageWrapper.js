import React from 'react';

/**
 * Wrapper for all pages, shows on the right of the Nav
 */
const PageWrapper = () => {
  return (
    <div className="leading-normal p-4 sm:p-8">
      <h1>Welcome to the Kitchen Sink</h1>
      <div className="yeep-text">
        <p>
          The aim of this page is to <strong>showcase all the various UI elements</strong> we plan
          to use in our app.
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
          A <code>&lt;fieldset&gt;</code> will be used to wrap labels and their form elements in
          most cases:
        </p>
      </div>
      <fieldset className="mb-6">
        <legend>legend text here</legend>
        <p className="mb-4">
          In almost all of our forms we have a horizontal label + text field layout (which should
          collapse to a vertical layout in mobile viewports). Taking our cue from Bootstrap, we will
          wrap each label + field with a <code>.form-group</code> class to facilitate this.
        </p>
        <div className="form-group mb-4">
          <label htmlFor="tempTextField">The label:</label>
          <input id="tempTextField" type="text" placeholder="The text field" />
        </div>
        <p className="mb-4">
          For viewports larger than Tailwinds 576px breakpoint the layout is as follows:
        </p>
        <ul className="mb-4">
          <li>The <code>&lt;label&gt;</code> will take 25% of the container width</li>
          <li>The text field / select element will take 50% of the container width</li>
          <li>Textareas take the full 75% of the container width</li>
          <li>Validation / neutral messages will appear underneath the form element</li>
        </ul>
        <div className="form-group mb-4">
          <label htmlFor="tempTextField2">Another field:</label>
          <input id="tempTextField2" type="text" placeholder="Another text field" />
          <div className="invalid">An error occured with this field</div>
        </div>
        <div className="form-group mb-4">
          <label htmlFor="tempTextField3">This is good:</label>
          <input id="tempTextField3" type="text" placeholder="Optional" />
          <div className="valid">Nice one!</div>
        </div>
        <div className="form-group mb-4">
          <label htmlFor="tempTextField4">Helpful layout:</label>
          <textarea
            id="tempTextField4"
            placeholder="Please write your innermost feelings"
            rows="10"
          />
          <div className="neutral">we are joking, do not do this, just give us a joke</div>
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Other form elements</legend>
        <p className="mb-4">A few different layouts and scenarios:</p>
        <div className="form-group mb-3">
          <label htmlFor="tempSelect1">Select / dropdown:</label>
          <select id="tempSelect1">
            <option value="0">-- Please choose a super power --</option>
            <option value="1">Option 1</option>
            <option value="1">Option 2</option>
            <option value="1">Option 3</option>
            <option value="1">Option 4</option>
          </select>
        </div>
        <div className="form-group mb-3">
          <label htmlFor="tempPassword1">Password:</label>
          <input type="password" id="textPassword1" placeholder="please enter a strong password" />
        </div>
      </fieldset>
    </div>
  );
};

export default PageWrapper;
