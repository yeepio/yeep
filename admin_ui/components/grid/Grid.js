import React from 'react';
import GridPager from './GridPager';

// WIP
const Grid = () => {
  return (
    <React.Fragment>
      <div className="py-2 text-center sm:flex sm:text-left">
        <p>
          Showing entities <strong>1</strong> or <strong>X</strong> of <strong>TOTAL</strong>:
        </p>
        <GridPager />
      </div>
      <div className="grid-wrapper">
        <table className="grid">
          <thead>
            <tr>
              <th className="text-left">
                <a href="/" className="grid-sorting-desc">
                  Organisation name
                </a>
              </th>
              <th>
                <a href="/" className="grid-sorting">
                  Slug / URL key
                </a>
              </th>
              <th>Users</th>
              <th>Roles</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <a href="/">Our Tech Blog</a>
              </td>
              <td className="text-center">blog</td>
              <td className="text-center">
                <a href="/">5</a>
              </td>
              <td className="text-center">
                <a href="/">4</a>
              </td>
              <td className="text-center">
                <a href="/">10</a>
              </td>
              <td className="text-center">
                <a href="/">Edit</a> <a href="/">Delete</a>
              </td>
            </tr>
            <tr>
              <td>
                <a href="/">Zoho CRM</a>
              </td>
              <td className="text-center">zoho_crm</td>
              <td className="text-center">
                <a href="/">40</a>
              </td>
              <td className="text-center">
                <a href="/">5</a>
              </td>
              <td className="text-center">
                <a href="/">11</a>
              </td>
              <td className="text-center">
                <a href="/">Edit</a> <a href="/">Delete</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid-footer">
        <div className="grid-per-page">
          <label htmlFor="perPage1">Display</label>
          <select id="perPage1">
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
        <GridPager />
      </div>
    </React.Fragment>
  );
};

export default Grid;
