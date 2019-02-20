import React from 'react';
import Select from 'react-select';

const perPageOptions = [
  { value: 10, label: '10 per page' },
  { value: 25, label: '25 per page' },
  { value: 50, label: '50 per page' },
];

const GridPerPage = () => {
  return (
    <Select
      className="flex-initial mb-2 mx-auto sm:mx-0 sm:mb-0 sm:w-1/3"
      defaultValue={perPageOptions[0]}
      options={perPageOptions}
    />
  );
};

export default GridPerPage;
