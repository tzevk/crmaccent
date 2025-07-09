import { executeQuery } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Setting up companies database...');

    // Create companies table
    const createCompaniesTable = `
      CREATE TABLE IF NOT EXISTS companies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await executeQuery(createCompaniesTable);
    console.log('Companies table created successfully');

    // Company names from CSV
    const companies = [
      "Agarwal Industrial Corpn. Ltd.",
      "Avenir International Engineers & Consultants",
      "Acoustics audio video automation",
      "Ace Technologies",
      "Aker Solutions Pvt Ltd.",
      "Akruli Jaidurga CHS Ltd.",
      "Amey Hindalekar",
      "ATUL Ltd.",
      "Aegis Group of Companies",
      "Amit Shah",
      "Alok's Clinic",
      "Anaven LLP",
      "Beauty Garage India Pvt Ltd",
      "Bharat Alt Fuel Pvt. Ltd",
      "BARC (Bhabha Atomic Research Centre)",
      "Britannaia Warehouse",
      "BHEL HPVP",
      "Bertrams India Pvt. Ltd",
      "Buro Happold",
      "Cannan Indikos",
      "Cynectix Design and Engineering Services LLP",
      "Cynectix Control Systems Private Limited",
      "Capital Engineering Consultancy",
      "Ciria India Limited",
      "Core Energy Systems Ltd.",
      "Concordenvro",
      "Dr. Tushar Hegde",
      "DVC Process Technologists",
      "DUTCO Tennant Bahrain",
      "DSG Consultants Pvt Ltd",
      "DG Design & Construction",
      "Dinesh Thosar",
      "Elite Consulting Engineers",
      "Five Elements Environment Technologies",
      "GEM",
      "Gexcon India Pvt. Ltd.",
      "Global Process Systems - GPS",
      "Global Solutions",
      "Gemini Engi-Fab Ltd",
      "Giga Factory",
      "Ganesh Piping",
      "Global Engineering",
      "GR Engineering and Consultancy",
      "GPS Renewables Pvt. Ltd",
      "Global Engineering, Guwahati",
      "Heeva Engineering Designs",
      "HIND ALUMINIUM ALLOYS",
      "Hindustan Colas Private Limited",
      "Hamon Cooling Systems",
      "Hindustan Petrolium Corporation Limited",
      "HAL Offshore Ltd.",
      "Hospertz India Pvt. Ltd.",
      "Isgec Heavy Engineering Ltd",
      "Inbuild Architects",
      "JAPS INC",
      "Jugal Udyog",
      "Jindal Saw LTD",
      "Jubilant Engineering Technologies",
      "JW Marriott Mumbai Juhu",
      "Just Dial",
      "JNK India Ltd.",
      "K Q Engineering Consultancy - UAE",
      "Kirpalaney & Associates (Engineers) Pvt Ltd",
      "Kiran PE Mineral Water Plant",
      "Kent",
      "Knexir consultants Pvt Ltd.",
      "K Raheja",
      "Konkan Lng Private Limited",
      "Larsen & Toubro Limited",
      "L & T Heavy Engineering",
      "LELE and Associates Pvt Ltd.",
      "LyondellBasell Industries",
      "LRQA",
      "Lasons India Pvt.Ltd",
      "IIM Indore || BITS Pilani",
      "Manish Tikle",
      "Monsoon Foods",
      "MITSU LIFE SCIENCE PRIVATE LIMITED",
      "Murugappa Water Technology & Solutions Pvt Ltd",
      "Meera Cleanfuels Pvt Ltd",
      "Middle East Technical Services LLC",
      "Mixxon Petrochemicals Pvt. Ltd.",
      "Mukand Ltd",
      "Nuvoco Vistas Corp Limited",
      "Naran Lala Pvt. Ltd.",
      "Nargan - UAE",
      "Oswal Energies Limited",
      "Oswal Infrastructure Limited",
      "Quality International Co.Ltd",
      "Petrofac Engineering (I) Pvt Ltd",
      "Petrofac International",
      "Primetals Technologies India Private Limited",
      "Petrofac International (UAE) LLC",
      "Prabhat Renewable Energy And Agro Private Limited",
      "Petrovision International LLC",
      "Pointshot India Private Limited",
      "Praj Highpurity Systems Limited",
      "Privi Speciality",
      "Petrofac Emirates LLC",
      "Praxair India Pvt. Ltd",
      "Pradeep Jain(Jalvayu Vihar)",
      "Quanta Procss",
      "Quality International Co.Ltd",
      "Quality Fabricators and Erectors Pvt.Ltd",
      "Reliance Fire Fighting Private Limited",
      "Reliance Industries Ltd",
      "Reliance Retail Limited",
      "S.M.Darveshi",
      "Sandu Brothers",
      "Sangir Plastics Pvt Ltd",
      "Sievert India Private Limited",
      "Saga Consultants",
      "Syed Engineering & Acoustic Consultancy",
      "Shroff and Associates Engineers Pvt Ltd.",
      "Sudhir Darveshi",
      "Sanahan Tech - NDT",
      "Sulzar India Ltd.",
      "Sitson India",
      "Spec Engineering",
      "Shiva Engineering",
      "Steam Equipments Pvt Ltd",
      "Shapoorji Pallonji and Company Private Limited (E&C Division)",
      "Shakil(MEP)",
      "Aditya Birla Sai Mahesh",
      "TATA Chemicals Ltd",
      "Technip Pvt Ltd",
      "TATA Projects",
      "Thyssenkrupp Industrial Solutions (India) Private Limited",
      "TSA Process Equipments Pvt. Ltd",
      "Technip Engergies India Ltd",
      "Tecnimont Private Limited",
      "Techno Design Consultant India Pvt Ltd",
      "TA Engineering",
      "TAJsats",
      "TECNICAS REUNIDAS",
      "Toyo Engineering India Pvt. Ltd.",
      "UBC Engineers Pvt Ltd",
      "UMPESL - Universal MEP Projects & Engineering Services Limited",
      "Vedlaxmi Engineering Solutions (OPC) Pvt. Ltd.",
      "VKVCLLP - VEE KAY VIKRAM & CO. LLP.",
      "VCS QUALITY SERVICES PVT. LTD.",
      "Vectras Enprocon Ltd",
      "Veekay Chemicals",
      "Watertek",
      "Wipro Enterprises (P) Limited",
      "Willbö engineering india pvt ltd",
      "Zeppelin System India Pvt Ltd.",
      "Rajaram Walve – Kudopi",
      "R K Infra (India) Pvt Ltd",
      "91 Square feet",
      "Energy Plant Engineering/ RINA Consulting Private Limited",
      "9Universal"
    ];

    // Clear existing companies
    await executeQuery('DELETE FROM companies');
    console.log('Existing companies cleared');

    // Insert companies
    for (const company of companies) {
      if (company.trim()) {
        try {
          await executeQuery(
            'INSERT INTO companies (name) VALUES (?)',
            [company.trim()]
          );
        } catch (error) {
          console.warn(`Skipping duplicate company: ${company}`);
        }
      }
    }

    console.log(`${companies.length} companies inserted successfully`);

    // Get final count
    const [countResult] = await executeQuery('SELECT COUNT(*) as count FROM companies');
    
    res.status(200).json({
      message: 'Companies database setup completed',
      companiesCount: countResult.count,
      tables: ['companies']
    });

  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({ 
      message: 'Database setup failed', 
      error: error.message 
    });
  }
}
