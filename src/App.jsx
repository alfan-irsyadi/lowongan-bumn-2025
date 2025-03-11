import React, { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import { listVacancy, vacancyMajor, vacancyEducation, detailVacancy } from "./helper/api";
import { JobDetail, cleanHTML } from "./components/JobDetail";
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
    console.log(pendingFilters)
    fetchVacancies(pendingFilters);
  };

  const handleVacancyClick = async (vacancy) => {
    console.log(vacancy)
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

  return (
    <div className="flex flex-row w-screen">
      <Sidebar onFilterChange={handleFilterChange} onApplyFilters={handleSubmit} />

      <div className="ml-96 p-6 w-full">
        {notification && <div className="bg-blue-100 p-4 text-gray-700 mb-4">{notification}</div>}

        {selectedVacancy ? (
          <div className="max-w-5xl mx-auto p-6 bg-[#ecf0f3] shadow-lg rounded-lg neo-button">
            {/* Company & selectedVacancy Title */}
            <div className="flex items-center space-x-3 mb-2">
              <img src={selectedVacancy.company_logo} alt="Company Logo" className="h-10" />
              <h2 className="text-2xl font-bold">{selectedVacancy.title}</h2>
            </div>
            <p className="text-gray-600">{selectedVacancy.company_name}</p>

            {/* selectedVacancy Meta Information */}
            <div className="flex space-x-4 text-sm text-gray-500 mt-2">
              <span>📍 {eval(selectedVacancy.placement_region_name).join(', ') || "Seluruh Indonesia"}</span>
              <span>🎯 {selectedVacancy.employment_status}</span>
              <span>💼 {selectedVacancy.experience_level_name}</span>
              <span>⚙️ {selectedVacancy.stream_name}</span>
            </div>

            {/* selectedVacancy Description */}
            <div className="border-t border-gray-300 mt-4 p-4 ">
              <h3 className="text-lg font-semibold mb-2">Deskripsi Pekerjaan</h3>
              <JobDetail jobDescription={selectedVacancy.description}/>
            </div>

            {/* Requirements */}
            <div className="border-t border-gray-300 mt-4 p-4">
              <h3 className="text-lg font-semibold mb-2">Persyaratan</h3>
              <JobDetail jobDescription={selectedVacancy.requirement} />
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
                {selectedVacancy.major?.major_type === "notin"
                  ? `Semua jurusan kecuali:`
                  : selectedVacancy.major?.major_type === "all"
                    ? "Semua jurusan" : ""}
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
            {!loading ? (
              <div className="space-y-6 mt-4">
                {vacancies.map((vacancy, index) => (
                  <div key={vacancy.vacancy_id} className="bg-white px-4 text-sm/8 py-8 shadow-lg rounded-lg border border-gray-200 relative neo-button" onClick={() => handleVacancyClick(vacancy)}>
                    <h2 className="text-lg font-bold">{`${index + 1}. ${vacancy.title}`}</h2>
                    <p className="text-gray-600">{vacancy.company_name}</p>

                    {/* Education Info */}
                    <div className="mt-2 text-sm/8 text-gray-700">
                      <p>🏫 {vacancy.education?.education_level || "-"} </p>
                      <p>📜 Min IPK: {vacancy.education?.score_min || "-"}</p>
                      {vacancy.education?.age_max && <p>🕑 Max Usia: {vacancy.education.age_max} Tahun</p>}
                    </div>

                    {/* Majors */}
                    <div className="mt-2">
                      <p className="text-blue-500 font-semibold">🎓 Semua jurusan yang dapat melamar:</p>
                      <p className="text-gray-700 max-h-36 overflow-y-auto">{vacancy.major?.list_major || "Semua Jurusan"}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex my-4 flex-row justify-between">
                      <div className="flex gap-2 mt-3">
                        <span className="bg-blue-200 text-blue-800 px-3 py-1 text-xs rounded-full">Pegawai Tetap</span>
                        {vacancy.stream_name && (
                          <span className="bg-green-200 text-green-800 px-3 py-1 text-xs rounded-full">
                            {vacancy.stream_name}
                          </span>
                        )}
                      </div>
                      <div>
                        <span>{vacancy.total_applied} / {vacancy.total_quota} ({parseInt(vacancy.total_applied / vacancy.total_quota*100)+"%"})</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className={`progress ${parseInt(vacancy.total_applied / vacancy.total_quota*100)<40?"bg-green-500":parseInt(vacancy.total_applied / vacancy.total_quota*100)<70?"bg-blue-600":"bg-red-600"}`} style={{width: parseInt(vacancy.total_applied / vacancy.total_quota*100)+"%"}}></div> 
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
