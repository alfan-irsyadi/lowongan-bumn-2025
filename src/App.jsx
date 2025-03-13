import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { listVacancy, vacancyMajor, vacancyEducation, detailVacancy } from "./helper/api";
import { JobDetail, cleanHTML } from "./components/JobDetail";
import "./App.css";
import { Menu, X } from "lucide-react";

function App() {
  const [pendingFilters, setPendingFilters] = useState({});
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [filters, setFilters] = useState({});
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [streamWeight, setStreamWeight] = useState({});

  const employWeight = {
    "Pegawai Kontrak":3,
    "Pegawai Tetap":  5
  }

  const calculate_score = (vacancy, streamWeight)=>{
    const skor = Math.round(
      (streamWeight[vacancy.stream_name] + 
        (vacancy.total_applied && !isNaN(vacancy.total_applied) 
          ? 1 - vacancy.total_applied / vacancy.total_quota : 0)*5 
        + employWeight[vacancy.employment_status])/15*100	,2)
      return skor;
  }

  useEffect(() => {
    console.log(window.screen.width)
    if (isSidebarOpen && window.screen.width<768) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden"); // Cleanup
    };
  }, [isSidebarOpen]);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
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
            score: calculate_score(item, streamWeight)
          })).sort((a, b) => b.score - a.score)
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

    <div className="flex flex-col w-screen">
      <div className="header">
        {/* Toggle Button */}

        <button
          className="top-4 md:hidden left-4 z-50 bg-gray-200 p-2 rounded-lg shadow-lg hover:bg-gray-300 transition"
          onClick={toggleSidebar} 
        >
          {isSidebarOpen?<X size={24}/>:<Menu size={24} />}
          
        </button>
        <img src="https://pkg-rbb.fhcibumn.id/navbar-rbb/_/_/_/_/public/assets/images/portal/home/bumn_untuk_indonesia.png" alt="" srcset="" height={"30px"} onClick={()=>window.location.reload()}/>
      </div>
      <div className="flex flex-row w-screen max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-1rem)] overflow-y-auto pt-14">

        <Sidebar 
        onFilterChange={handleFilterChange} onApplyFilters={handleSubmit} isSidebarOpen={isSidebarOpen} 
        setStreamWeight={setStreamWeight}/>

        <div className={`flex flex-col h-full w-full float-left p-4`}>
          {notification && <div className="bg-blue-100 p-4 text-gray-700 mb-4">{notification}</div>}

          {selectedVacancy ? (
            <div className="max-w-5xl mx-auto p-6 bg-[#ecf0f3] shadow-lg rounded-lg bevel">
              <div className="emboss">
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
              </div>

              {/* selectedVacancy Description */}
              <div className=" border-gray-300 mt-4 p-4 ">
                <h3 className="text-lg font-semibold mb-2">Deskripsi Pekerjaan</h3>
                <JobDetail jobDescription={selectedVacancy.description} />
              </div>

              {/* Requirements */}
              <div className=" border-gray-300 mt-4 p-4">
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
            <div className="max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-1rem-200px)] overflow-y-auto">
              <h1 className="text-xl font-semibold">Job Vacancies:</h1>
              {!loading ? (
                <div className="space-y-6 mt-4">
                  {vacancies.map((vacancy, index) => (                    
                    <div key={vacancy.vacancy_id} className="bg-white px-4 text-xs/8 py-8 shadow-lg rounded-lg border border-gray-200 relative neo-button" onClick={() => handleVacancyClick(vacancy)}>
                      <div className="flex justify-between">
                        <div>
                          <h2 className="text-lg font-bold">{`${index + 1}. ${vacancy.title}`}</h2>
                          <p className="text-sm/6 text-gray-400">{vacancy.company_name}</p>
                        </div>
                        <div>                          
                          <span className="font-bold">score : {vacancy.score}%</span>
                        </div>
                      </div>

                      {/* Education Info */}
                      <div className="mt-2 text-xs/6 text-gray-700">
                        <p>🏫 {vacancy.education?.education_level || "-"} </p>
                        <p>📜 Min IPK: {vacancy.education?.score_min || "-"}</p>
                        {vacancy.education?.age_max && <p>🕑 Max Usia: {vacancy.education.age_max} Tahun</p>}
                      </div>

                      {/* Majors */}
                      <div className="mt-2 text-xs/6">
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
                          <span className="text-xs">{vacancy.total_applied} / {vacancy.total_quota} ({parseInt(vacancy.total_applied / vacancy.total_quota * 100) + "%"})</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress ${parseInt(vacancy.total_applied / vacancy.total_quota * 100) < 40 ? "bg-green-500" : parseInt(vacancy.total_applied / vacancy.total_quota * 100) < 70 ? "bg-blue-600" : "bg-red-600"}`} style={{ width: parseInt(vacancy.total_applied / vacancy.total_quota * 100) + "%" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
