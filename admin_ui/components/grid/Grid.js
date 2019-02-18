import React from 'react';
import GridPager from './GridPager';
import GridPerPage from './GridPerPage';
import GridSortingLink from './GridSortingLink';

// WIP
const Grid = () => {
  return (
    <React.Fragment>
      <div className="py-2 text-center sm:flex sm:text-left">
        <p>
          Showing entities <strong>1</strong> to <strong>X</strong> of <strong>TOTAL</strong>:
        </p>
        <GridPager />
      </div>
      <style jsx>{`
        .grid-wrapper {
          max-width: calc(100vw - 2rem);
        }
      `}</style>
      <div className="grid-wrapper overflow-x-auto scrolling-touch">
        <table className="grid w-full border-collapse border-b border-grey">
          <thead>
            <tr>
              <th className="text-left border-grey border-t border-b p-2 font-normal">
                <GridSortingLink direction="asc">Organisation name</GridSortingLink>
              </th>
              <th className="border-grey border-t border-b p-2 font-normal">
                <GridSortingLink>Slug / URL key</GridSortingLink>
              </th>
              <th className="border-grey border-t border-b p-2 font-normal">Users</th>
              <th className="border-grey border-t border-b p-2 font-normal">Roles</th>
              <th className="border-grey border-t border-b p-2 font-normal">Permissions</th>
              <th className="border-grey border-t border-b p-2 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-grey-lightest">
              <td className="p-2">
                <a href="/">Our Tech Blog</a>
              </td>
              <td className="p-2 text-center">blog</td>
              <td className="p-2 text-center">
                <a href="/">5</a>
              </td>
              <td className="p-2 text-center">
                <a href="/">4</a>
              </td>
              <td className="p-2 text-center">
                <a href="/">10</a>
              </td>
              <td className="p-2 text-center">
                <a href="/">Edit</a> <a href="/">Delete</a>
              </td>
            </tr>
            <tr>
              <td className="p-2">
                <a href="/">Zoho CRM</a>
              </td>
              <td className="p-2 text-center">zoho_crm</td>
              <td className="p-2 text-center">
                <a href="/">40</a>
              </td>
              <td className="p-2 text-center">
                <a href="/">5</a>
              </td>
              <td className="p-2 text-center">
                <a href="/">11</a>
              </td>
              <td className="p-2 text-center">
                <a href="/">Edit</a> <a href="/">Delete</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="sm:flex flex-row text-center items-center py-2">
        <GridPerPage />
        <GridPager />
      </div>
    </React.Fragment>
  );
};

export default Grid;
