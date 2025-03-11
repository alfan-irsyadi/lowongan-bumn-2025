import React, { useState } from "react";
import Select from "react-select";

const MultiSelect = ({ options, onChange }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleChange = (selected) => {
    setSelectedOptions(selected);
    if (onChange) onChange(selected);
  };

  return (
    <Select
      isMulti
      options={options}
      value={selectedOptions}
      onChange={handleChange}
      placeholder="Select options..."
    />
  );
};

export default MultiSelect;
