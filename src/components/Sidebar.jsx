import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { listCompany, listEducationLevel, listExperienceLevel, listMajor, listStream, pilihan } from "../helper/api";

const fetchOptions = async (inputValue, name, fun, value, label) => {
  try {
    const data = await fun();
    let options = data
      .filter((item) => item[label].toLowerCase().includes(inputValue.toLowerCase()))
      .map((item) => ({ value: item[value], label: item[label] }));

      if(name!='Jurusan')
        return [{ value: "", label: `Tampilkan Semua` }, ...options]; // Unique "all" value
      else
      return [{ value: "", label: `Tampilkan Semua` }, { value: "all-major", label: `Semua Jurusan` },...options]; // Unique "all" value
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

const customStyles = {
  control: (provided) => ({
    ...provided,
    border: "none",
    borderRadius: "12px",
    background: "#ecf0f3",
    boxShadow: "5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff",
    padding: "10px",
    transition: "0.3s ease-in-out",
    "&:hover": {
      boxShadow: "8px 8px 15px #d1d9e6, -8px -8px 15px #ffffff",
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "12px",
    background: "#ecf0f3",
    boxShadow: "5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff",
  }),
  option: (provided, { isSelected }) => ({
    ...provided,
    background: isSelected ? "#d1d9e6" : "#ecf0f3",
    color: isSelected ? "#333" : "#555",
    boxShadow: isSelected
      ? "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff"
      : "none",
    "&:hover": {
      background: "#d1d9e6",
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    background: "#ecf0f3",
    borderRadius: "10px",
    boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "#333",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    "&:hover": {
      background: "#d1d9e6",
    },
  }),
};

function Sidebar({ onFilterChange, onApplyFilters }) {
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleChange = (category) => (selected) => {
    if (!selected || selected.length === 0) {
      // If all options are cleared, show "Tampilkan Semua" again
      const resetSelection = [{ value: "", label: "Tampilkan Semua" }];
      setSelectedOptions((prev) => ({ ...prev, [category]: resetSelection }));
      onFilterChange(category, resetSelection);
      return;
    }

    const hasAllOption = selected.some((option) => option.value === "");

    if (hasAllOption && selected.length>1) {
        // Otherwise, remove "Tampilkan Semua" and keep other selections
      console.log('// Otherwise, remove "Tampilkan Semua" and keep other selections')
      const filteredOptions = selected.filter((option) => option.value !== "");
      setSelectedOptions((prev) => ({ ...prev, [category]: filteredOptions }));
      onFilterChange(category, filteredOptions);    
      
    } else {
      // If "Tampilkan Semua" is selected, remove other selections
      console.log('// If "Tampilkan Semua" is selected, remove other selections')
      const onlyAllOption = [{ value: "", label: "Tampilkan Semua" }];
      setSelectedOptions((prev) => ({ ...prev, [category]: onlyAllOption }));
      onFilterChange(category, onlyAllOption);
    }
    console.log(selected)
    console.log(selectedOptions)
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-96 shadow-md p-6 overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Data</h2>
      {pilihan.map((e, index) => (
        <div key={index} className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-1">
            {e.detail}
          </label>
          <AsyncSelect
            isMulti
            cacheOptions
            loadOptions={(inputValue) => fetchOptions(inputValue, e.detail, e.fungsi, e.value, e.label)}
            defaultOptions
            placeholder={`Pilih ${e.detail}`}
            value={selectedOptions[e.id] || [{ value: "", label: "Tampilkan Semua" }]}
            onChange={handleChange(e.id)}
            styles={customStyles}
          />
        </div>
      ))}
       <button onClick={onApplyFilters} className="neo-button mt-4">
        Apply Filters
      </button>
    </div>
  );
}

export default Sidebar;
