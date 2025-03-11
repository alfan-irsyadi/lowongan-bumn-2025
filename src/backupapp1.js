import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import { listVacancy, vacancyMajor, detailVacancy } from "./helper/api";
import "./App.css";
import createDOMPurify from 'dompurify';
import JobDetail from "./components/JobDetail";

const DOMPurify = createDOMPurify(window);

function App() {
  const [pendingFilters, setPendingFilters] = useState({});
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [filters, setFilters] = useState({});
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleVacancyClick = async (vacancy) => {
    try {
      if (vacancy.description) {
        setSelectedVacancy(vacancy);
        return;
      }
  
      const detail = await detailVacancy(vacancy.vacancy_id);
      setSelectedVacancy({ ...vacancy, ...detail });
    } catch (error) {
      console.error("Error fetching vacancy details:", error);
    }
  };
  

  const handleFilterChange = (category, selectedOptions) => {
    const hasAllOption = selectedOptions.length <= 1 && selectedOptions[0]?.value === "";
    const selected = hasAllOption ? [] : selectedOptions.map((e) => e.value);

    setPendingFilters((prevFilters) => ({
      ...prevFilters,
      [category]: selected,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setFilters(pendingFilters);
  
    try {
      // Step 1: Fetch job vacancies
      let data = await listVacancy(
        pendingFilters.stream_id || [],
        pendingFilters.company_id || [],
        pendingFilters.experience_level || [],
        pendingFilters.education_level || [],
        pendingFilters.major_id || []
      );
  
      // Step 2: Extract vacancy IDs
      let vacancyIds = data.map((job) => job.vacancy_id);
  
      // Step 3: Fetch major data using vacancy IDs
      let majorData = vacancyIds.length > 0 ? await vacancyMajor(vacancyIds) : [];
      let majorMap = {};
      majorData.forEach((item) => {
        majorMap[item.vacancy_id] = { major_type: item.major_type, list_major: item.list_major } || "";
      });
  
      // Step 4: Merge vacancy data with major data (but NOT detailVacancy)
      const uniqueVacancies = data.map((item) => ({
        ...item,
        major: majorMap[item.vacancy_id] || "",
      }));
  
      setVacancies(uniqueVacancies);
  
    } catch (error) {
      console.error("Error fetching vacancies:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-row">
      <Sidebar onFilterChange={handleFilterChange} />
      <div className="ml-96 p-6 w-full">
        {selectedVacancy ? (
          <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            {/* Company & Job Title */}
            <div className="flex items-center space-x-3 mb-2">
              <img src={selectedVacancy.company_logo} alt="Company Logo" className="h-10" />
              <h2 className="text-2xl font-bold">{selectedVacancy.title}</h2>
            </div>
            <p className="text-gray-600">{selectedVacancy.company_name}</p>

            {/* Job Meta Information */}
            <div className="flex space-x-4 text-sm text-gray-500 mt-2">
              <span>📍 {selectedVacancy.placement_region_name || "Seluruh Indonesia"}</span>
              <span>💼 {selectedVacancy.employment_status}</span>
              <span>👤 {selectedVacancy.experience_level_name}</span>
              <span>⚙️ {selectedVacancy.stream_name}</span>
            </div>

            {/* Job Description */}
            <div className="border-t border-gray-300 mt-4 pt-4">
              <h3 className="text-lg font-semibold mb-2">Deskripsi Pekerjaan</h3>
              <p className="text-gray-700">{selectedVacancy.description}</p>
            </div>

            {/* Requirements */}
            <div className="border-t border-gray-300 mt-4 pt-4">
              <h3 className="text-lg font-semibold mb-2">Persyaratan</h3>
              <p className="text-gray-700">{selectedVacancy.requirement}</p>
            </div>

            {/* Qualifications */}
            <div className="bg-gray-100 p-4 rounded-lg mt-6">
              <h3 className="text-lg font-semibold">Kualifikasi</h3>
              <div className="flex items-center space-x-2 text-gray-700 mt-2">
                <span>🎓</span>
                <span>
                  {selectedVacancy.qualifications.education_level[0].education_level} - Min. IPK:{" "}
                  {selectedVacancy.qualifications.education_level[0].score_min}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700 mt-2">
                <span>🚻</span>
                <span>{selectedVacancy.qualifications.gender === "male" ? "Laki-laki" : "Perempuan"}</span>
              </div>
            </div>

            {/* Eligible Majors */}
            <div className="bg-gray-100 p-4 rounded-lg mt-4">
              <h3 className="text-lg font-semibold">Jurusan yang dapat melamar:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {selectedVacancy.qualifications.major.list_major.map((major, index) => (
                  <li key={index}>{major}</li>
                ))}
              </ul>
            </div>

            <button className="neo-button mt-4" onClick={() => setSelectedVacancy(null)}>Tutup</button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Job Vacancies:</h1>
            <button onClick={handleSubmit} className="neo-button">Apply Filters</button>
            {loading && <div className="info flex bg-blue-100 w-full p-4">
              <p className="mt-4 text-gray-500">Loading vacancies...</p>
              </div>}
            {!loading && (
              <ul className="vacancy-list flex flex-col gap-5">
              {vacancies.map((vacancy, index) => (
                <li key={vacancy.vacancy_id} className="vacancy-item p-4 border-b border-gray-300 neo-button" onClick={() => handleVacancyClick(vacancy)}>
                  <h2 className="text-lg font-bold">{`${index + 1}. ${vacancy.title}`}</h2>
                  <p className="text-gray-600">{vacancy.company_name}</p>
                  <p className="text-sm">Quota: {vacancy.total_quota}</p>
                  <p className="text-sm">Status: {vacancy.employment_status}</p>
                </li>
              ))}
            </ul>
            
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
