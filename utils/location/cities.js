/**
 * City data organized by country code
 * This file contains major cities for job searching
 * Cities are loaded lazily - only requested country's cities are imported
 */

// Major cities by country - organized for lazy loading
const citiesByCountry = {
    US: [
        'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
        'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
        'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
        'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Boston, MA',
        'Washington, DC', 'Nashville, TN', 'Oklahoma City, OK', 'El Paso, TX', 'Portland, OR',
        'Las Vegas, NV', 'Detroit, MI', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
        'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
        'Atlanta, GA', 'Kansas City, MO', 'Miami, FL', 'Raleigh, NC', 'Omaha, NE',
        'Minneapolis, MN', 'Cleveland, OH', 'Tampa, FL', 'Pittsburgh, PA', 'Cincinnati, OH',
        'Salt Lake City, UT', 'Orlando, FL', 'Boulder, CO', 'Palo Alto, CA', 'Mountain View, CA',
    ].sort(),
    GB: [
        'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield',
        'Edinburgh', 'Bristol', 'Leicester', 'Coventry', 'Nottingham', 'Newcastle upon Tyne',
        'Brighton', 'Hull', 'Plymouth', 'Wolverhampton', 'Derby', 'Southampton', 'Reading',
        'Cambridge', 'Oxford', 'Milton Keynes', 'Cardiff', 'Belfast', 'Aberdeen', 'Dundee',
    ].sort(),
    CA: [
        'Toronto, ON', 'Montreal, QC', 'Vancouver, BC', 'Calgary, AB', 'Edmonton, AB',
        'Ottawa, ON', 'Winnipeg, MB', 'Quebec City, QC', 'Hamilton, ON', 'Kitchener, ON',
        'London, ON', 'Victoria, BC', 'Halifax, NS', 'Oshawa, ON', 'Windsor, ON',
        'Saskatoon, SK', 'Regina, SK', 'St. Johns, NL', 'Barrie, ON', 'Kelowna, BC',
    ].sort(),
    AU: [
        'Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD', 'Perth, WA', 'Adelaide, SA',
        'Gold Coast, QLD', 'Newcastle, NSW', 'Canberra, ACT', 'Sunshine Coast, QLD',
        'Wollongong, NSW', 'Hobart, TAS', 'Geelong, VIC', 'Townsville, QLD', 'Cairns, QLD',
        'Darwin, NT', 'Toowoomba, QLD', 'Ballarat, VIC', 'Bendigo, VIC',
    ].sort(),
    DE: [
        'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf',
        'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg',
        'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Karlsruhe',
        'Mannheim', 'Augsburg', 'Wiesbaden', 'Gelsenkirchen', 'Aachen', 'Heidelberg',
    ].sort(),
    FR: [
        'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
        'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne',
        'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Clermont-Ferrand',
    ].sort(),
    NL: [
        'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg',
        'Groningen', 'Almere', 'Breda', 'Nijmegen', 'Apeldoorn', 'Arnhem', 'Haarlem',
        'Enschede', 'Amersfoort', 'Zaanstad', 'Den Bosch', 'Haarlemmermeer', 'Leiden',
    ].sort(),
    IN: [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
        'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
        'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
        'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar',
        'Noida', 'Gurgaon', 'Chandigarh', 'Coimbatore', 'Kochi', 'Trivandrum',
    ].sort(),
    SG: ['Singapore'].sort(),
    AE: [
        'Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah', 'Fujairah',
    ].sort(),
    IE: [
        'Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford', 'Drogheda', 'Swords',
        'Dundalk', 'Bray', 'Navan', 'Kilkenny', 'Ennis', 'Tralee', 'Carlow',
    ].sort(),
    SE: [
        'Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping',
        'Helsingborg', 'Jönköping', 'Norrköping', 'Lund', 'Umeå', 'Gävle', 'Borås',
    ].sort(),
    CH: [
        'Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Winterthur', 'Lucerne',
        'St. Gallen', 'Lugano', 'Biel', 'Thun', 'Köniz', 'La Chaux-de-Fonds', 'Fribourg',
    ].sort(),
    // Austria - also supports Ausbildung
    AT: [
        'Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt', 'Villach',
        'Wels', 'St. Pölten', 'Dornbirn', 'Wiener Neustadt', 'Steyr', 'Feldkirch',
        'Bregenz', 'Leonding', 'Klosterneuburg', 'Baden', 'Leoben', 'Krems',
    ].sort(),
    ES: [
        'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia',
        'Palma de Mallorca', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid',
        'Vigo', 'Gijón', 'Granada', 'Vitoria-Gasteiz', 'A Coruña', 'San Sebastián',
    ].sort(),
    IT: [
        'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence',
        'Bari', 'Catania', 'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Brescia',
        'Parma', 'Taranto', 'Prato', 'Modena', 'Reggio Calabria', 'Perugia',
    ].sort(),
    JP: [
        'Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki',
        'Kyoto', 'Saitama', 'Hiroshima', 'Sendai', 'Chiba', 'Kitakyushu', 'Sakai',
        'Niigata', 'Hamamatsu', 'Kumamoto', 'Sagamihara', 'Okayama', 'Shizuoka',
    ].sort(),
    BR: [
        'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte',
        'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 'Belém', 'Goiânia', 'Guarulhos',
        'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal',
    ].sort(),
    MX: [
        'Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez',
        'Zapopan', 'Mérida', 'San Luis Potosí', 'Aguascalientes', 'Hermosillo', 'Saltillo',
        'Mexicali', 'Culiacán', 'Querétaro', 'Morelia', 'Chihuahua', 'Cancún',
    ].sort(),
    PL: [
        'Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz',
        'Lublin', 'Katowice', 'Białystok', 'Gdynia', 'Częstochowa', 'Radom', 'Sosnowiec',
    ].sort(),
    PT: [
        'Lisbon', 'Porto', 'Vila Nova de Gaia', 'Amadora', 'Braga', 'Coimbra', 'Funchal',
        'Almada', 'Setúbal', 'Queluz', 'Agualva-Cacém', 'Aveiro', 'Évora', 'Faro',
    ].sort(),
    KR: [
        'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan',
        'Changwon', 'Seongnam', 'Goyang', 'Yongin', 'Bucheon', 'Ansan', 'Cheongju',
    ].sort(),
    NZ: [
        'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin',
        'Palmerston North', 'Napier-Hastings', 'Nelson', 'Rotorua', 'New Plymouth',
    ].sort(),
    // Morocco
    MA: [
        'Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda',
        'Kenitra', 'Tetouan', 'Safi', 'El Jadida', 'Nador', 'Beni Mellal', 'Khouribga',
        'Taza', 'Mohammedia', 'Essaouira', 'Settat', 'Ksar El Kebir', 'Larache',
    ].sort(),
    // Algeria
    DZ: [
        'Algiers', 'Oran', 'Constantine', 'Annaba', 'Batna', 'Blida', 'Sétif', 'Djelfa',
        'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'El Oued', 'Skikda', 'Tiaret', 'Béjaïa',
    ].sort(),
    // Tunisia
    TN: [
        'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Gafsa',
        'Monastir', 'Ben Arous', 'Kasserine', 'Médenine', 'Nabeul', 'Tataouine',
    ].sort(),
    // Egypt
    EG: [
        'Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Luxor',
        'Mansoura', 'El Mahalla El Kubra', 'Tanta', 'Asyut', 'Ismailia', 'Fayoum',
        'Zagazig', 'Aswan', 'Damietta', 'Hurghada', 'Sharm El Sheikh',
    ].sort(),
    // Saudi Arabia
    SA: [
        'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran', 'Taif',
        'Tabuk', 'Buraydah', 'Khamis Mushait', 'Hofuf', 'Jubail', 'Yanbu', 'Abha',
    ].sort(),
    // UAE
    // Turkey
    TR: [
        'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep', 'Konya',
        'Mersin', 'Diyarbakir', 'Kayseri', 'Eskisehir', 'Samsun', 'Denizli', 'Sanliurfa',
    ].sort(),
    // Pakistan
    PK: [
        'Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Hyderabad',
        'Peshawar', 'Islamabad', 'Quetta', 'Bahawalpur', 'Sargodha', 'Sialkot', 'Sukkur',
    ].sort(),
    // Jordan
    JO: [
        'Amman', 'Zarqa', 'Irbid', 'Russeifa', 'Aqaba', 'Madaba', 'Salt', 'Mafraq',
    ].sort(),
    // Lebanon
    LB: [
        'Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Jounieh', 'Zahle', 'Byblos',
    ].sort(),
    // Palestine
    PS: [
        'Gaza', 'Ramallah', 'Hebron', 'Nablus', 'Bethlehem', 'Jenin', 'Tulkarm', 'Jericho',
    ].sort(),
    // Kuwait
    KW: [
        'Kuwait City', 'Hawalli', 'Salmiya', 'Farwaniya', 'Jahra', 'Fahaheel', 'Mangaf',
    ].sort(),
    // Qatar
    QA: [
        'Doha', 'Al Wakrah', 'Al Khor', 'Dukhan', 'Mesaieed', 'Lusail',
    ].sort(),
    // Bahrain
    BH: [
        'Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Isa Town', 'Sitra',
    ].sort(),
    // Nigeria
    NG: [
        'Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Kaduna',
        'Maiduguri', 'Zaria', 'Aba', 'Jos', 'Ilorin', 'Oyo', 'Enugu', 'Abeokuta',
    ].sort(),
    // South Africa
    ZA: [
        'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein',
        'East London', 'Nelspruit', 'Kimberley', 'Polokwane', 'Pietermaritzburg',
    ].sort(),
    // Kenya
    KE: [
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale',
    ].sort(),
    // Argentina
    AR: [
        'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'San Miguel de Tucumán',
        'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan', 'Resistencia', 'Neuquén',
    ].sort(),
    // Colombia
    CO: [
        'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Cúcuta', 'Bucaramanga',
        'Pereira', 'Santa Marta', 'Ibagué', 'Manizales', 'Villavicencio',
    ].sort(),
    // Chile
    CL: [
        'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco',
        'Rancagua', 'Talca', 'Arica', 'Chillán', 'Puerto Montt', 'Iquique',
    ].sort(),
    // Russia
    RU: [
        'Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod',
        'Chelyabinsk', 'Samara', 'Omsk', 'Rostov-on-Don', 'Ufa', 'Krasnoyarsk', 'Voronezh',
    ].sort(),
    // Ukraine
    UA: [
        'Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Lviv', 'Zaporizhzhia', 'Kryvyi Rih',
        'Mykolaiv', 'Vinnytsia', 'Kherson', 'Poltava', 'Chernihiv', 'Zhytomyr',
    ].sort(),
    // China
    CN: [
        'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan',
        'Xian', 'Chongqing', 'Nanjing', 'Tianjin', 'Suzhou', 'Zhengzhou', 'Changsha',
    ].sort(),
};

// Default cities for countries not in the detailed list
const defaultCities = ['Capital City', 'Major City'];

/**
 * Get cities for a country - lazy loaded
 */
export function getCitiesForCountry(countryCode) {
    return citiesByCountry[countryCode] || defaultCities;
}

/**
 * Search cities within a country
 */
export function searchCities(countryCode, query) {
    const cities = getCitiesForCountry(countryCode);
    if (!query) return cities;
    const lowerQuery = query.toLowerCase();
    return cities.filter(city => city.toLowerCase().includes(lowerQuery));
}

/**
 * Check if we have detailed city data for a country
 */
export function hasDetailedCities(countryCode) {
    return !!citiesByCountry[countryCode];
}

export { citiesByCountry };
