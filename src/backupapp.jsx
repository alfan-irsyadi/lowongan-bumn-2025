import React, { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import { listVacancy, vacancyMajor, vacancyEducation, detailVacancy } from "./helper/api";
import "./App.css";

function App() {
  const [pendingFilters, setPendingFilters] = useState({});
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [filters, setFilters] = useState({});
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");  

  const fetchVacancies = async (appliedFilters) => {
    setLoading(true);
    setNotification("Loading vacancies...");

    try {
      const data = await listVacancy(
        appliedFilters.stream_id || [],
        appliedFilters.company_id || [],
        appliedFilters.experience_level || [],
        appliedFilters.education_level || [],
        appliedFilters.major_id || []
      );
      if (data.length > 0) {
        const vacancyIds = data.map((job) => job.vacancy_id);

        const [majorData, educationData] = await Promise.all([
          vacancyMajor(vacancyIds),
          vacancyEducation(vacancyIds),
        ]);

        // Convert response into lookup maps
        const majorMap = Object.fromEntries(majorData.map((item) => [item.vacancy_id, item]));
        const educationMap = Object.fromEntries(educationData.map((item) => [item.vacancy_id, item]));

        setVacancies(
          data.map((item) => ({
            ...item,
            major: majorMap[item.vacancy_id] || {},
            education: educationMap[item.vacancy_id] || {},
          }))
        );
        setNotification(`${data.length} vacancies found.`);
      } else {
        setVacancies([]);
        setNotification("No vacancies found.");
      }
    } catch (error) {
      console.error("Error fetching vacancies:", error);
      setNotification("Error fetching vacancies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (category, selectedOptions) => {
    const hasAllOption = selectedOptions.length <= 1 && selectedOptions[0]?.value === "";
    const selected = hasAllOption ? [] : selectedOptions.map((e) => e.value);

    setPendingFilters((prevFilters) => ({
      ...prevFilters,
      [category]: selected,
    }));

    setNotification("Filters selected. Click Apply Filters to update.");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setFilters(pendingFilters);
    console.log
    fetchVacancies(filters);
  };

  const handleVacancyClick = useCallback(async (vacancy) => {
    if (vacancy.description) {
      setSelectedVacancy(vacancy);
      return;
    }
    try {
      const detail = await detailVacancy(vacancy.vacancy_id);
      setSelectedVacancy({ ...vacancy, ...detail });
    } catch (error) {
      console.error("Error fetching vacancy details:", error);
    }
  }, []);

  return (
    <div className="flex flex-row w-screen">
      <Sidebar onFilterChange={handleFilterChange} />
      <div className="ml-96 p-6 w-full">
        {notification && <div className="bg-blue-100 p-4 text-gray-700 mb-4">{notification}</div>}

        {selectedVacancy ? (
          <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <img src={selectedVacancy.company_logo} alt="Company Logo" className="h-10" />
              <h2 className="text-2xl font-bold">{selectedVacancy.title}</h2>
            </div>
            <p className="text-gray-600">{selectedVacancy.company_name}</p>
            <div className="flex space-x-4 text-sm text-gray-500 mt-2">
              <span>📍 {selectedVacancy.placement_region_name || "Seluruh Indonesia"}</span>
              <span>💼 {selectedVacancy.employment_status}</span>
              <span>👤 {selectedVacancy.experience_level_name}</span>
              <span>⚙️ {selectedVacancy.stream_name}</span>
            </div>
            <div className="border-t border-gray-300 mt-4 pt-4">
              <h3 className="text-lg font-semibold mb-2">Deskripsi Pekerjaan</h3>
              <p className="text-gray-700">{selectedVacancy.description}</p>
            </div>
            <div className="border-t border-gray-300 mt-4 pt-4">
              <h3 className="text-lg font-semibold mb-2">Persyaratan</h3>
              <p className="text-gray-700">{selectedVacancy.requirement}</p>
            </div>
            <button className="neo-button mt-4" onClick={() => setSelectedVacancy(null)}>Tutup</button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Job Vacancies:</h1>
            <button onClick={handleSubmit} className="neo-button">Apply Filters</button>
            {!loading ? (
              <div className="space-y-6 mt-4">
                {vacancies.map((vacancy, index) => (
                  <div key={vacancy.vacancy_id} className="bg-white p-6 shadow-lg rounded-lg border border-gray-200" onClick={handleVacancyClick}>
                    <h2 className="text-lg font-bold">{`${index + 1}. ${vacancy.title}`}</h2>
                    <p className="text-gray-600">{vacancy.company_name}</p>

                    {/* Education Info */}
                    <div className="mt-2 text-sm text-gray-700">
                      <p>🎓 {vacancy.education?.education_level || "-"} </p>
                      <p>📌 Min IPK: {vacancy.education?.score_min || "-"}</p>
                      {vacancy.education?.age_max && <p>🕑 Max Usia: {vacancy.education.age_max} Tahun</p>}
                    </div>

                    {/* Majors */}
                    <div className="mt-2">
                      <p className="text-blue-500 font-semibold">🎓 Semua jurusan yang dapat melamar:</p>
                      <p className="text-gray-700">{vacancy.major?.list_major || "Semua Jurusan"}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 mt-3">
                      <span className="bg-blue-200 text-blue-800 px-3 py-1 text-xs rounded-full">Pegawai Tetap</span>
                      {vacancy.stream_name && (
                        <span className="bg-green-200 text-green-800 px-3 py-1 text-xs rounded-full">
                          {vacancy.stream_name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
