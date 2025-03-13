import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { listCompany, listEducationLevel, listExperienceLevel, listMajor, listStream, pilihan } from "../helper/api";
import { jobStreams, getDynamicStreamWeights } from "../helper/ai2";
import { Menu } from "lucide-react"; // Icon for toggle

const fetchOptions = async (inputValue, name, fun, value, label) => {
  try {
    const data = await fun();
    let options = data
      .filter((item) => item[label].toLowerCase().includes(inputValue.toLowerCase()))
      .map((item) => ({ value: item[value], label: item[label] }));

    if (name != 'Jurusan')
      return [{ value: "", label: `Tampilkan Semua` }, ...options]; // Unique "all" value
    else
      return [{ value: "", label: `Tampilkan Semua` }, { value: "all-major", label: `Semua Jurusan` }, ...options]; // Unique "all" value
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
    zIndex: 9999, // Ensures dropdown appears on top
    position: "absolute",
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

const Sidebar = ({ onFilterChange, onApplyFilters, isSidebarOpen , setStreamWeight}) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [toggleDiv, setToggleDiv] = useState(false);
  const [toggleUserInterest, setToggleUserInterest] = useState(false);
  const [userInterest, setUserInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [weightSuccess, setWeightSuccess] = useState(false)
  const [isGenerate, setIsGenerate] = useState(false)
  const [streamWeight, setLocalStreamWeight] = useState(
    jobStreams.reduce((acc, cur) => ({ ...acc, [cur]: 3 }), {})
  );
  setStreamWeight(streamWeight)

  const submitUserInterest = async (e) => {
    setIsGenerate(true)
    setLoading(true)
    setWeightSuccess(false)
    const weights = await getDynamicStreamWeights(e)
    setLocalStreamWeight(weights)
    setStreamWeight(weights)
    console.log(weights)
    setIsGenerate(false)
    setLoading(false)
    setWeightSuccess(true)
  }

  const handleChange = (category) => (selected) => {
    if (!selected || selected.length === 0) {
      // If all options are cleared, show "Tampilkan Semua" again
      const resetSelection = [{ value: "", label: "Tampilkan Semua" }];
      setSelectedOptions((prev) => ({ ...prev, [category]: resetSelection }));
      onFilterChange(category, resetSelection);
      return;
    }

    const hasAllOption = selected.some((option) => option.value === "");

    if (hasAllOption && selected.length > 1) {
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

  const handleStreamWeightChange = (e) => {
    const newWeight = { ...streamWeight, [stream_name]: e.target.value }
    console.log(newWeight)
    setStreamWeight(newWeight)
    setLocalStreamWeight(newWeight)
  }

  const onOptionChange = (e) => setToggleUserInterest(e.target.value == "interest")
  return (
    <div
      className={`glassmorphism fixed md:w-1/2 left-0 ease-in-out duration-1000 z-40 md:static md:flex max-h-[calc(100vh-150px)] md:max-h-[calc(100vh-80px)] overflow-y-auto
    ${isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}      
    >



      <div
        className="w-screen md:w-full shadow-md overflow-y-auto p-6"
        style={{ maxHeight: "calc(100vh - 20px)" }} // Prevents blocking dropdowns
      >


        {/* <div className="flex justify-end">
          
          </div> */}
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
        <div className="flex justify-between p-4">
          <label htmlFor="switcher">apakah mencari job yang relevan?</label>
          <input type="checkbox" name="switcher" id="" value={toggleDiv} onChange={(e) => setToggleDiv(e.target.checked)} />
        </div>
        {toggleDiv && (
          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-4 w-full" onClick={() => setToggleUserInterest(true)}>
              <input type="radio" value={"interest"} checked={toggleUserInterest} name="radio-switcher" id="radio-switcher-interest"
                onChange={onOptionChange}
              />
              <label htmlFor="radio" >Berdasarkan User Interest</label>
            </div>
            <div className="flex gap-4 w-full" onClick={() => setToggleUserInterest(false)}>
              <input type="radio" value={"weight"} checked={!toggleUserInterest} name="radio-switcher" id="radio-switcher-weight"
                onChange={onOptionChange}
              />
              <label htmlFor="radio">Berdasarkan Weight</label>
            </div>

            <div className={`w-full {toggleUserInterest ? "" : "hidden"}`}>
              <label htmlFor="interest">User Interest</label><br />
              <input type="text" name="interest" className="bevel w-full"
                value={userInterest}
                onChange={(e) => setUserInterest(e.target.value)}
                disabled={!toggleUserInterest} />
              <button type="button" className="neo-button my-4 w-full" onClick={() => submitUserInterest(userInterest)}>
                {loading ? "Loading" : "Generate"}
              </button>
              <div className={`w-full p-4 ${!isGenerate && weightSuccess?"bg-green-400":isGenerate && !weightSuccess ? "bg-red-400":""}`}>{weightSuccess ? "Berhasil generate Bobot Stream" : "Gagal"}</div>
            </div>
            <div className={!toggleUserInterest ? "flex flex-col text-sm gap-4" : "flex-col gap-4 text-sm hidden"}>
              <span className="text-gray-500">input tingkat kecocokan dari 1 hingga 5</span>
              {jobStreams.map((stream_name) => (

                <div key={stream_name.replaceAll(' ', '_').toLowerCase()} className="flex flex-row justify-between">
                  <label htmlFor={stream_name.replaceAll(' ', '_').toLowerCase()}>{stream_name}</label>
                  <input type="text" name={stream_name.replaceAll(' ', '_').toLowerCase()} className="w-20 text-center bevel" value={streamWeight[stream_name]} onChange={handleStreamWeightChange} />
                </div>
              ))}
            </div>
            {/* <input type="text" name="w" className="bevel" /> */}
          </div>
        )}
        <button onClick={onApplyFilters} className="neo-button mt-4 w-full">
          Apply Filters
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
