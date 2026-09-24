// Rwandan Administrative Hierarchy: Provinces -> Districts -> Sectors
// Standard administrative division established by the Ministry of Local Government (MINALOC)

export interface DistrictData {
  name: string;
  sectors: string[];
}

export interface ProvinceData {
  name: string;
  districts: DistrictData[];
}

export const RWANDA_LOCATIONS: ProvinceData[] = [
  {
    name: 'Kigali City',
    districts: [
      {
        name: 'Gasabo',
        sectors: [
          'Bumbogo', 'Gatsata', 'Gikomero', 'Gisozi', 'Jabana', 'Jali',
          'Kacyiru', 'Kimihurura', 'Kimironko', 'Kinyinya', 'Ndera',
          'Nduba', 'Remera', 'Rusororo', 'Rutunga'
        ]
      },
      {
        name: 'Kicukiro',
        sectors: [
          'Gahanga', 'Gatenga', 'Gikondo', 'Kagarama', 'Kanombe',
          'Kicukiro', 'Kigarama', 'Masaka', 'Niboye', 'Nyarugunga'
        ]
      },
      {
        name: 'Nyarugenge',
        sectors: [
          'Gitega', 'Kanyinya', 'Kigali', 'Kimisagara', 'Mageragere',
          'Muhima', 'Nyakabanda', 'Nyamirambo', 'Nyarugenge', 'Rwezamenyo'
        ]
      }
    ]
  },
  {
    name: 'Eastern Province',
    districts: [
      {
        name: 'Bugesera',
        sectors: ['Gashora', 'Juru', 'Kamabuye', 'Mareba', 'Mayange', 'Musenyi', 'Mwogo', 'Ngeruka', 'Ntarama', 'Nyamata', 'Nyarushishi', 'Rilima', 'Ruhuha', 'Rweru', 'Shyara']
      },
      {
        name: 'Rwamagana',
        sectors: ['Fumbwe', 'Gahengeri', 'Gishari', 'Karenge', 'Kigabiro', 'Muhazi', 'Musha', 'Muyumbu', 'Mwulire', 'Nyakaliro', 'Nzige', 'Rubona']
      },
      {
        name: 'Kayonza',
        sectors: ['Gahini', 'Kabare', 'Kabarondo', 'Mukarange', 'Murama', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Ruramira', 'Rwinkwavu']
      },
      {
        name: 'Gatsibo',
        sectors: ['Gasange', 'Gatsibo', 'Gitoki', 'Kabarore', 'Kageyo', 'Kiramuruzi', 'Kiziguro', 'Muhura', 'Murambi', 'Ngarama', 'Nyagihanga', 'Remera', 'Rugarama', 'Rwimbogo']
      },
      {
        name: 'Nyagatare',
        sectors: ['Gatunda', 'Karama', 'Karangazi', 'Katabagemu', 'Kiyombe', 'Matimba', 'Mimuri', 'Mukama', 'Musheli', 'Nyagatare', 'Rukomo', 'Rwempasha', 'Rwimiyaga', 'Tabagwe']
      },
      {
        name: 'Ngoma',
        sectors: ['Gashanda', 'Jarama', 'Karembo', 'Kazo', 'Kibungo', 'Mugesera', 'Murama', 'Mutenderi', 'Remera', 'Rukira', 'Rukumberi', 'Rurenge', 'Sake', 'Zaza']
      },
      {
        name: 'Kirehe',
        sectors: ['Gahara', 'Gatore', 'Kigarama', 'Kirehe', 'Mahama', 'Mpanga', 'Musaza', 'Mushikiri', 'Nasho', 'Nyamugari', 'Nyarubuye']
      }
    ]
  },
  {
    name: 'Northern Province',
    districts: [
      {
        name: 'Musanze',
        sectors: ['Busogo', 'Cyuve', 'Gacaca', 'Gashaki', 'Gataraga', 'Kimonyi', 'Kinigi', 'Muhoza', 'Muko', 'Musanze', 'Nkotsi', 'Nyange', 'Remera', 'Rwaza', 'Shingiro']
      },
      {
        name: 'Rulindo',
        sectors: ['Base', 'Burega', 'Bushoki', 'Buyoga', 'Cyinzuzi', 'Cyungo', 'Kinihira', 'Kisaro', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Ntarabana', 'Rukozo', 'Rusiga', 'Shyorongi', 'Tumba']
      },
      {
        name: 'Gicumbi',
        sectors: ['Bukamba', 'Bwisige', 'Byumba', 'Cyumba', 'Giti', 'Kaniga', 'Manyagiro', 'Miyove', 'Kageyo', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Nyankenke', 'Rubaya', 'Rukomo', 'Rushaki', 'Rutare', 'Ruvune', 'Rwamiko', 'Shangasha']
      },
      {
        name: 'Burera',
        sectors: ['Bungwe', 'Butaro', 'Cyanika', 'Cyeru', 'Gahunga', 'Gatebe', 'Gitovu', 'Kagogo', 'Kinoni', 'Kinyababa', 'Kivuye', 'Nemba', 'Rugarama', 'Rugengabari', 'Ruhunde', 'Rusarabuye', 'Rwerere']
      },
      {
        name: 'Gakenke',
        sectors: ['Busengo', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi', 'Janja', 'Kamubuga', 'Karambo', 'Kivuruga', 'Mataba', 'Minazi', 'Mugunga', 'Muhondo', 'Muyongwe', 'Muzo', 'Nemba', 'Ruli', 'Rusasa', 'Rushashi']
      }
    ]
  },
  {
    name: 'Southern Province',
    districts: [
      {
        name: 'Huye',
        sectors: ['Gishamvu', 'Karama', 'Kigoma', 'Kinazi', 'Maraba', 'Mbazi', 'Mukura', 'Ngoma', 'Ruhashya', 'Huye', 'Rusatira', 'Rwaniro', 'Simbi', 'Tumba']
      },
      {
        name: 'Muhanga',
        sectors: ['Cyeza', 'Kabacuzi', 'Kibangu', 'Kiyumba', 'Muhanga', 'Mushishiro', 'Nyabinoni', 'Nyamabuye', 'Nyarusange', 'Rongi', 'Rugendabari', 'Shyogwe']
      },
      {
        name: 'Kamonyi',
        sectors: ['Gacurabwenge', 'Karama', 'Kayenzi', 'Kayumbu', 'Mugina', 'Musambira', 'Ngamba', 'Nyamiyaga', 'Nyarubaka', 'Rugarika', 'Rukoma', 'Runda']
      },
      {
        name: 'Nyanza',
        sectors: ['Busasamana', 'Busoro', 'Cyabakamyi', 'Kibilizi', 'Kigoma', 'Mukingo', 'Muyira', 'Ntyazo', 'Nyagisozi', 'Rwabicuma']
      },
      {
        name: 'Ruhango',
        sectors: ['Bweramana', 'Byimana', 'Kabagari', 'Kinazi', 'Kinihira', 'Mbuye', 'Mwendo', 'Ntongwe', 'Ruhango']
      },
      {
        name: 'Gisagara',
        sectors: ['Gikonko', 'Gishubi', 'Kansi', 'Kibilizi', 'Kigembe', 'Mamba', 'Muganza', 'Mugombwa', 'Mukindo', 'Musha', 'Ndora', 'Nyanza', 'Save']
      },
      {
        name: 'Nyamagabe',
        sectors: ['Buruhukiro', 'Cyanika', 'Gatare', 'Kaduha', 'Kamegeli', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Musange', 'Musebeya', 'Mushubi', 'Nkomane', 'Gasaka', 'Tare', 'Uwinkingi']
      },
      {
        name: 'Nyaruguru',
        sectors: ['Cyahinda', 'Busanze', 'Kibeho', 'Kivu', 'Mata', 'Muganza', 'Munini', 'Ngera', 'Ngoma', 'Nyabimata', 'Nyagisozi', 'Ruheru', 'Ruramba', 'Rusenge']
      }
    ]
  },
  {
    name: 'Western Province',
    districts: [
      {
        name: 'Rubavu',
        sectors: ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gisenyi', 'Kanama', 'Kanzenze', 'Mudende', 'Nyakiriba', 'Nyamyumba', 'Nyundo', 'Rubavu', 'Rugerero']
      },
      {
        name: 'Rusizi',
        sectors: ['Bugarama', 'Butare', 'Bweyeye', 'Gashonga', 'Giheke', 'Gihundwe', 'Gikundiro', 'Gitambi', 'Kamembe', 'Muganza', 'Mururu', 'Nkanka', 'Nkombo', 'Nkungu', 'Nyakabuye', 'Nyakarenzo', 'Nzahaha', 'Rwimbogo']
      },
      {
        name: 'Karongi',
        sectors: ['Bwishyura', 'Gishyita', 'Gashari', 'Gitesi', 'Mubuga', 'Murambi', 'Murundi', 'Mutuntu', 'Rubengera', 'Rugabano', 'Ruganda', 'Rwankuba', 'Twumba']
      },
      {
        name: 'Rutsiro',
        sectors: ['Boneza', 'Gihango', 'Kigeyo', 'Kivumu', 'Manihira', 'Mukura', 'Murunda', 'Musasa', 'Mushonyi', 'Mushubati', 'Nyabirasi', 'Ruhango', 'Rusebeya']
      },
      {
        name: 'Nyabihu',
        sectors: ['Bigogwe', 'Jenda', 'Jomba', 'Kabatwa', 'Karago', 'Kintobo', 'Mukamira', 'Muringa', 'Rambura', 'Rugera', 'Rurembo', 'Shyira']
      },
      {
        name: 'Ngororero',
        sectors: ['Bwira', 'Gatumba', 'Hindiro', 'Kabaya', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ndaro', 'Ngororero', 'Nyange', 'Sovu']
      },
      {
        name: 'Nyamasheke',
        sectors: ['Bushekeri', 'Bushenge', 'Cyato', 'Gihombo', 'Kagano', 'Kanjongo', 'Karambi', 'Karengera', 'Kirimbi', 'Macuba', 'Nyabitekeri', 'Mahembe', 'Rangiro', 'Ruharambuga', 'Shangi']
      }
    ]
  }
];

export const getProvinces = (): string[] => RWANDA_LOCATIONS.map((p) => p.name);

export const getDistrictsByProvince = (provinceName: string): string[] => {
  const prov = RWANDA_LOCATIONS.find((p) => p.name.toLowerCase() === provinceName.toLowerCase());
  return prov ? prov.districts.map((d) => d.name) : [];
};

export const getSectorsByDistrict = (districtName: string): string[] => {
  for (const prov of RWANDA_LOCATIONS) {
    const dist = prov.districts.find((d) => d.name.toLowerCase() === districtName.toLowerCase());
    if (dist) return dist.sectors;
  }
  return [];
};
