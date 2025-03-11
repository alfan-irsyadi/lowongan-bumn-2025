import axios from 'axios';

const baseURL = 'https://api-rbb.fhcibumn.id/general/career';

const headers = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJCRDkxQTQxM0NGMTZCQzYyNzUxRkQwMkEyMUNGODZDMTgzREE3NjhCMUVCRDY3Q0M2QUY3MEE3M0U0NkMzODVGMjFBMDY3MzE1NEM5MEEyM0RDMjRDNzUyQjg5ODY3NjgiLCJjb21wYW55X2lkIjoiNkVDQzQxRkNFNjZEQzkwNUUyRjRGOUVCRkQyMEE2MTAiLCJ1c2VybGV2ZWwiOiJCRTU1NzYyMDgyODY2NzMwNkM2OTIxQUI0OEQ1MkY1NCIsInR5cGVfdXNlciI6IjIzQzlFNjMyMjc5QzI1ODI1RjFGRDdBRDVBNzdCRTQwIiwiaWF0IjoxNzQxNTM0MTcxLCJleHAiOjE3NDE1NDQ5NzF9.vWqwvBeZfzn5QbaQGzL1_WX-Z1RZxKf2CQKZLokdW4I",
    "Origin": "https://rekrutmenbersama2025.fhcibumn.id",
    "Referer": "https://rekrutmenbersama2025.fhcibumn.id/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
    "Priority": "u=0",
    "TE": "trailers",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0"
};

// Fungsi-fungsi API
export const vacancyMajor = async (listVacancyId) => {
    try {
        const response = await axios.post(`${baseURL}/vacancy-major`, { vacancy_id: listVacancyId }, { headers });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching vacancy major:", error);
        throw error;
    }
};

export const vacancyEducation = async (listVacancyId) => {
    try {
        const response = await axios.post(`${baseURL}/vacancy-education`, { vacancy_id: listVacancyId }, { headers });
        return response.data; // Sesuaikan ini jika struktur respons berbeda
    } catch (error) {
        console.error("Error fetching vacancy education:", error);
        throw error;
    }
};

export const detailVacancy = async (vacancyId) => {
    try {
        const response = await axios.post(`${baseURL}/detail-vacancy`, { vacancy_id: vacancyId }, { headers });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching detail vacancy:", error);
        throw error;
    }
};

export const listCompany = async () => {
    try {
        const response = await axios.post(`${baseURL}/list-company`, {}, { headers });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching company list:", error);
        throw error;
    }
};

export const listExperienceLevel = async () => {
    try {
        const response = await axios.post(`${baseURL}/list-experience-level`, {}, { headers });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching experience level list:", error);
        throw error;
    }
};

export const listEducationLevel = async () => {
    try {
        const response = await axios.post(`${baseURL}/list-education-level`, {}, { headers });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching education level list:", error);
        throw error;
    }
};

export const listMajor = async () => {
    try {
        const response = await axios.post(`${baseURL}/list-major`, {}, { headers });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching major list:", error);
        throw error;
    }
};

export const listStream = async () => {
    try {
        const response = await axios.post(`${baseURL}/list-stream`, {}, { headers });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching stream list:", error);
        throw error;
    }
};

export const listVacancy = async (stream_id = [], company_id = [], experience_level = [], education_level = [], major_id = []) => {
    let allData = [];
    let page = 1;

    try {
        while (true) {
            const data = {
                page: page,
                size: 15,
                job_title: "",
                stream_id: stream_id,
                company_id: company_id,
                experience_level: experience_level,
                education_level: education_level,
                major_id: major_id,
                search: ""
            };

            const response = await axios.post(`${baseURL}/list-vacancy`, data, { headers });
            const vacancyData = response.data.data;

            if (!vacancyData || vacancyData.length === 0) {
                break;
            }

            allData = allData.concat(vacancyData);
            page++;
        }
        return allData;
    } catch (error) {
        console.error("Error fetching vacancy list:", error);
        throw error;
    }
};

export const pilihan = [
    {
        id : "company_id",
        detail: "Perusahaan",
        fungsi: listCompany,
        value: "id",
        label: "company_name",
    },
    {
        id : "experience_level",
        detail: "Jenis Pengalaman",
        fungsi: listExperienceLevel,
        value: "experience_level_id",
        label: "experience_level_name",
    },
    {
        id : "stream_id",
        detail: "Jenis Bidang",
        fungsi: listStream,
        value: "stream_id",
        label: "stream_name",
    },
    {
        id : "education_level",
        detail: "Tingkat Pendidikan",
        fungsi: listEducationLevel,
        value: "value",
        label: "label",
    },
    {
        id : "major_id",
        detail: "Jurusan",
        fungsi: listMajor,
        value: "id",
        label: "label",
    },
];