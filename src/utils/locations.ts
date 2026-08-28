export interface CountryLocation {
  name: string
  code: string
  flag: string
  cities: string[]
}

export const COUNTRIES_DATA: CountryLocation[] = [
  {
    name: 'Nigeria',
    code: 'NG',
    flag: '🇳🇬',
    cities: [
      'Lagos (Ikeja, Lekki, Victoria Island, Yaba)',
      'Abuja (FCT)',
      'Port Harcourt (Rivers)',
      'Ibadan (Oyo)',
      'Enugu (Enugu)',
      'Benin City (Edo)',
      'Abeokuta (Ogun)',
      'Kano (Kano)',
      'Uyo (Akwa Ibom)',
      'Owerri (Imo)',
      'Asaba / Warri (Delta)',
      'Calabar (Cross River)',
      'Kaduna (Kaduna)',
      'Jos (Plateau)',
      'Ilorin (Kwara)',
      'Akure (Ondo)',
      'Ado-Ekiti (Ekiti)',
      'Osogbo (Osun)',
      'Lokoja (Kogi)',
      'Other City in Nigeria',
    ],
  },
  {
    name: 'Ghana',
    code: 'GH',
    flag: '🇬🇭',
    cities: [
      'Accra (Greater Accra)',
      'Kumasi (Ashanti)',
      'Takoradi (Western)',
      'Tamale (Northern)',
      'Tema',
      'Cape Coast (Central)',
      'Sunyani (Bono)',
      'Ho (Volta)',
      'Other City in Ghana',
    ],
  },
  {
    name: 'Kenya',
    code: 'KE',
    flag: '🇰🇪',
    cities: [
      'Nairobi',
      'Mombasa',
      'Kisumu',
      'Nakuru',
      'Eldoret',
      'Thika',
      'Malindi',
      'Other City in Kenya',
    ],
  },
  {
    name: 'South Africa',
    code: 'ZA',
    flag: '🇿🇦',
    cities: [
      'Johannesburg (Gauteng)',
      'Cape Town (Western Cape)',
      'Durban (KwaZulu-Natal)',
      'Pretoria (Gauteng)',
      'Gqeberha (Port Elizabeth)',
      'Bloemfontein (Free State)',
      'East London',
      'Other City in South Africa',
    ],
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    cities: [
      'London',
      'Manchester',
      'Birmingham',
      'Edinburgh',
      'Glasgow',
      'Leeds',
      'Bristol',
      'Liverpool',
      'Cambridge',
      'Oxford',
      'Other City in UK',
    ],
  },
  {
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    cities: [
      'New York, NY',
      'San Francisco / Bay Area, CA',
      'Austin, TX',
      'Los Angeles, CA',
      'Seattle, WA',
      'Chicago, IL',
      'Atlanta, GA',
      'Boston, MA',
      'Miami, FL',
      'Dallas / Houston, TX',
      'Denver, CO',
      'Other City in US',
    ],
  },
  {
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    cities: [
      'Toronto (Ontario)',
      'Vancouver (British Columbia)',
      'Montreal (Quebec)',
      'Calgary (Alberta)',
      'Ottawa (Ontario)',
      'Edmonton (Alberta)',
      'Waterloo / Kitchener',
      'Other City in Canada',
    ],
  },
  {
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    cities: [
      'Berlin',
      'Munich',
      'Frankfurt',
      'Hamburg',
      'Cologne',
      'Stuttgart',
      'Dusseldorf',
      'Other City in Germany',
    ],
  },
  {
    name: 'Rwanda',
    code: 'RW',
    flag: '🇷🇼',
    cities: [
      'Kigali',
      'Gisenyi (Rubavu)',
      'Musanze (Ruhengeri)',
      'Huye (Butare)',
      'Muhanga',
      'Other City in Rwanda',
    ],
  },
  {
    name: 'Uganda',
    code: 'UG',
    flag: '🇺🇬',
    cities: [
      'Kampala',
      'Entebbe',
      'Jinja',
      'Gulu',
      'Mbarara',
      'Other City in Uganda',
    ],
  },
  {
    name: 'Egypt',
    code: 'EG',
    flag: '🇪🇬',
    cities: [
      'Cairo',
      'Alexandria',
      'Giza',
      'Sharm El Sheikh',
      'Mansoura',
      'Other City in Egypt',
    ],
  },
  {
    name: 'India',
    code: 'IN',
    flag: '🇮🇳',
    cities: [
      'Bengaluru (Bangalore)',
      'Mumbai',
      'Delhi / NCR',
      'Hyderabad',
      'Pune',
      'Chennai',
      'Kolkata',
      'Other City in India',
    ],
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    flag: '🇦🇪',
    cities: [
      'Dubai',
      'Abu Dhabi',
      'Sharjah',
      'Ajman',
      'Ras Al Khaimah',
      'Other City in UAE',
    ],
  },
  {
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    cities: [
      'Sydney (NSW)',
      'Melbourne (VIC)',
      'Brisbane (QLD)',
      'Perth (WA)',
      'Adelaide (SA)',
      'Other City in Australia',
    ],
  },
  {
    name: 'Other Country',
    code: 'OTHER',
    flag: '🌍',
    cities: [
      'Remote Worldwide',
      'Capital City / Major Tech Hub',
      'Other City',
    ],
  },
]

/**
 * Validates whether a given string is a genuine, standard LinkedIn profile URL
 */
export function isValidLinkedInUrl(url: string): boolean {
  if (!url || !url.trim()) return false
  const clean = url.trim().toLowerCase()
  // Matches linkedin.com/in/username or https://www.linkedin.com/in/username
  const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-\.%]+(\/.*)?$/
  return linkedinRegex.test(clean)
}

/**
 * Validates standard URLs
 */
export function isValidUrl(url: string): boolean {
  if (!url || !url.trim()) return false
  try {
    const formatted = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
    new URL(formatted)
    return true
  } catch {
    return false
  }
}

