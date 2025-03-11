import React, { useState, useEffect } from 'react';
import { listCompany } from '../helper/api';

function MyComponent() {
    const [companies, setCompanies] = useState([]);
    const [error, setError] = useState(null);    
    console.log(companies)
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await listCompany();
                setCompanies(data);
            } catch (err) {
                setError(err.message || 'Terjadi kesalahan saat memuat data.');
            }
        };

        fetchCompanies();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }
    console.log(companies)
    if(companies.length!=0){
        console.log('loaded')
        return (
            <div>
                <h1>Daftar Perusahaan</h1>
                <ul>
                    {companies.map(company => (                                        
                        <li key={company.id}>{company.company_name}</li>
                    ))}
                </ul>
            </div>
        )
    }
        
    console.log('not loaded')
    return (
        <div>
            hai
        </div>
    )
    
}

export default MyComponent;
