import { useState, useEffect } from 'react';

// Rwandan Administrative Hierarchy: Provinces -> Districts -> Sectors -> Cells -> Villages
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

// Rich hierarchy: Sector -> Cell -> Villages
export const SECTOR_CELLS_VILLAGES: Record<string, Record<string, string[]>> = {
  // ── GASABO ──
  Remera: {
    'Rukiri I': ['Inyange', 'Rebero', 'Ubumwe', 'Amahoro', 'Ituze'],
    'Rukiri II': ['Kigali View', 'Urumuri', 'Gasave', 'Nyarurembo'],
    'Nyabisindu': ['Amarembo I', 'Amarembo II', 'Gihogere', 'Kagara', 'Kinunga', 'Nyabisindu', 'Rugarama'],
    'Gishushu': ['Ingenzi', 'Kabutare', 'Gasabo', 'Umurava']
  },
  Kimironko: {
    'Bibare': ['Abatuje', 'Amariza', 'Imanzi', 'Imena', 'Imitari', 'Inganji', 'Ingenzi', 'Ingeri', 'Inshuti', 'Intashyo', 'Intwari'],
    'Kibagabaga': ['Buranga', 'Gasharu', 'Kageyo', 'Kamatamu', 'Karongi', 'Nyarutarama', 'Ruragiro'],
    'Nyagatovu': ['Icyerekezo', 'Urugero', 'Isangano', 'Umwezi']
  },
  Kacyiru: {
    'Kamatamu': ['Amajyambere', 'Bukinanyana', 'Cyimana', 'Gataba', 'Itetero', 'Kabare', 'Kamuhire', 'Karukamba', 'Nyagacyamo', 'Rwinzovu'],
    'Kamukina': ['Agataba', 'Inkingi', 'Intambwe', 'Urukundo'],
    'Kibaza': ['Kabagari', 'Kigarama', 'Ubumwe', 'Virunga']
  },
  Kinyinya: {
    'Gacuriro': ['Agatare', 'Binunga', 'Gasave', 'Inyange', 'Kabuhande', 'Kami', 'Karuruma'],
    'Kagugu': ['Gicikiza', 'Gitanga', 'Kadobogo', 'Rugarama', 'Rukingu'],
    'Murama': ['Akababaji', 'Gasharu', 'Musezero', 'Nyarubuye'],
    'Gasharu': ['Akarere', 'Gasharu', 'Ruyenzi', 'Taba']
  },
  Kimihurura: {
    'Kimihurura': ['Amahoro', 'Indatwa', 'Isangano', 'Ubumwe'],
    'Kamukina': ['Agataba', 'Inkingi', 'Intambwe'],
    'Rugando': ['Gasabo', 'Gasogi', 'Nyarurembo', 'Rugando']
  },
  Gisozi: {
    'Musezero': ['Amizero', 'Gasave', 'Gasharu', 'Kanyinya', 'Musezero', 'Rwinzovu'],
    'Ruhango': ['Kagara', 'Kumukenke', 'Ntora', 'Ruhango']
  },
  Gatsata: {
    'Karuruma': ['Akamwunguzi', 'Bushororo', 'Karuruma'],
    'Nyamabuye': ['Agatare', 'Hanika', 'Nyamabuye'],
    'Nyamugari': ['Akagihumyo', 'Kigarama', 'Nyamugari']
  },
  Bumbogo: {
    'Kinyaga': ['Gisiza', 'Kinyaga', 'Ryamanyoni'],
    'Mvuzo': ['Bumbogo', 'Kayumba', 'Mvuzo'],
    'Ngara': ['Kinteko', 'Ngara', 'Rurembo'],
    'Nkuzuzu': ['Gasiza', 'Nkuzuzu', 'Rubungo'],
    'Musave': ['Gatare', 'Musave', 'Nyagahinga']
  },
  Jabana: {
    'Akamatamu': ['Akamatamu', 'Gatovu', 'Rebero'],
    'Cyeyere': ['Cyeyere', 'Gasharu', 'Rugarama'],
    'Kabuye': ['Gacyamo', 'Kabuye', 'Rebero'],
    'Ngiryi': ['Kabeza', 'Ngiryi', 'Nyarubuye'],
    'Taba': ['Agatare', 'Taba', 'Urumuri']
  },
  Jali: {
    'Agateko': ['Agateko', 'Gitaba', 'Nyarubuye'],
    'Buhiza': ['Buhiza', 'Kabeza', 'Rugarama'],
    'Nyaburiba': ['Nyaburiba', 'Nyakabanda', 'Rwankuba'],
    'Nkusi': ['Kigarama', 'Nkusi', 'Ubumwe']
  },
  Ndera: {
    'Bwiza': ['Bwiza', 'Gasharu', 'Jurwe'],
    'Cyaruzinge': ['Cyaruzinge', 'Masoro', 'Munini'],
    'Kibenga': ['Kibenga', 'Murambi', 'Ruhanga'],
    'Mukuyu': ['Mukuyu', 'Nyarutarama', 'Uwamahoro'],
    'Rudashya': ['Kabeza', 'Rudashya', 'Rutunga']
  },
  Nduba: {
    'Butare': ['Butare', 'Gasharu', 'Nyacyonga'],
    'Gasura': ['Gasura', 'Kanyirabugoyi', 'Mubuga'],
    'Gatare': ['Gatare', 'Kigarama', 'Nyamweru'],
    'Muremure': ['Muremure', 'Rebero', 'Shango'],
    'Shango': ['Akanyana', 'Kigabiro', 'Shango']
  },
  Rusororo: {
    'Gasogi': ['Gasogi', 'Gikomero', 'Rusororo'],
    'Kabuga I': ['Kabuga', 'Kigarama', 'Rebero'],
    'Kabuga II': ['Amahoro', 'Kabuga', 'Urugwiro'],
    'Kinyana': ['Gatare', 'Kinyana', 'Nyarubuye'],
    'Mbandazi': ['Mbandazi', 'Rukore', 'Runyonza'],
    'Nyagahinga': ['Gasharu', 'Nyagahinga', 'Rubona'],
    'Ruhanga': ['Kabeza', 'Murambi', 'Ruhanga']
  },
  Rutunga: {
    'Gasabo': ['Gasabo', 'Indatwa', 'Rebero'],
    'Indatwa': ['Indatwa', 'Kigabiro', 'Munanira'],
    'Kabuga': ['Kabuga', 'Nyagasozi', 'Ubumwe']
  },
  Gikomero: {
    'Gasenyi': ['Gasenyi', 'Murambi', 'Rebero'],
    'Kibara': ['Kibara', 'Mataba', 'Runyinya'],
    'Munini': ['Gasharu', 'Munini', 'Nyamugari'],
    'Murambi': ['Kigarama', 'Murambi', 'Urugwiro']
  },

  // ── KICUKIRO ──
  Niboye: {
    'Gatare': ['Gatare', 'Gasogi', 'Rebero', 'Rwezamenyo'],
    'Niboye': ['Indatwa', 'Niboye', 'Rugando', 'Sonatube'],
    'Nyakabanda': ['Kigarama', 'Nyakabanda', 'Ubumwe']
  },
  Kicukiro: {
    'Gasharu': ['Gasharu', 'Kigarama', 'Murambi'],
    'Kagunga': ['Kagunga', 'Mahoro', 'Rebero'],
    'Ngoma': ['Kabeza', 'Ngoma', 'Nyarurembo']
  },
  Kanombe: {
    'Busanza': ['Antenne', 'Busanza', 'Kariyeri', 'Nyamagana'],
    'Karama': ['Giporoso', 'Karama', 'Muhororo'],
    'Kabeza': ['Kabeza', 'Rebero', 'Umubano'],
    'Rubirizi': ['Kabeza', 'Muyange', 'Rubirizi']
  },
  Gikondo: {
    'Kagunga': ['Kagunga', 'Kanserege', 'Marembo'],
    'Kinunga': ['Kinunga', 'Nyarurembo', 'Rugunga'],
    'Shyorongi': ['Gikondo Centre', 'Rebero', 'Shyorongi']
  },
  Kagarama: {
    'Kanserege': ['Kanserege', 'Rebero', 'Rugando'],
    'Muyange': ['Gatare', 'Muyange', 'Ubumwe'],
    'Rukatsa': ['Kagarama', 'Rukatsa', 'Urugwiro']
  },
  Gatenga: {
    'Cyimo': ['Cyimo', 'Gasharu', 'Rwezamenyo'],
    'Gatenga': ['Gatenga', 'Murambi', 'Rebero'],
    'Karambo': ['Karambo', 'Kigarama', 'Ubumwe'],
    'Nyanza': ['Nyanza', 'Nyarurama', 'Taba']
  },
  Gahanga: {
    'Gahanga': ['Gahanga', 'Kagasa', 'Rwinzovu'],
    'Kagasa': ['Gatare', 'Kagasa', 'Murambi'],
    'Karembure': ['Karembure', 'Murehe', 'Nyakuguma'],
    'Murinja': ['Murinja', 'Nunga', 'Ruhuha'],
    'Nunga': ['Kabeza', 'Nunga', 'Rebero']
  },
  Masaka: {
    'Ayabaramba': ['Ayabaramba', 'Gasharu', 'Rebero'],
    'Cyimo': ['Cyimo', 'Kigarama', 'Nyarurama'],
    'Gako': ['Gako', 'Masaka', 'Urugwiro'],
    'Gitaraga': ['Gitaraga', 'Kabeza', 'Rusheshe'],
    'Mbabe': ['Mbabe', 'Murambi', 'Nyagahinga'],
    'Rusheshe': ['Kabeza', 'Masaka Centre', 'Rusheshe']
  },
  Kigarama: {
    'Bwerankori': ['Bwerankori', 'Gatare', 'Kigarama'],
    'Karugira': ['Karugira', 'Murambi', 'Rebero'],
    'Nyarurama': ['Gatare', 'Nyarurama', 'Rebero'],
    'Rwampara': ['Amahoro', 'Rwampara', 'Ubumwe']
  },
  Nyarugunga: {
    'Kamashashi': ['Gasaraba', 'Kamashashi', 'Mulindi'],
    'Nonko': ['Kabeza', 'Nonko', 'Nyarugunga'],
    'Rwimbogo': ['Gasharu', 'Murambi', 'Rwimbogo']
  },

  // ── NYARUGENGE ──
  Nyarugenge: {
    'Biryogo': ['Biryogo', 'Gabiro', 'Isangano', 'Nyiranuma'],
    'Kiyovu': ['Cercle Sportif', 'Inyenyeri', 'Kiyovu', 'Muhima', 'Rugunga'],
    'Rwampara': ['Amahoro', 'Gasharu', 'Rwampara']
  },
  Muhima: {
    'Amahoro': ['Amahoro', 'Sangwa', 'Ubumwe'],
    'Kabasengere': ['Kabasengere', 'Murambi', 'Rebero'],
    'Kaborondo': ['Gitega', 'Kaborondo', 'Kigarama'],
    'Nyabugogo': ['Gatare', 'Nyabugogo', 'Rugenge'],
    'Taba': ['Agatare', 'Taba', 'Urumuri'],
    'Ubuzima': ['Indatwa', 'Ubuzima', 'Urugwiro']
  },
  Nyamirambo: {
    'Cyivugiza': ['Cyivugiza', 'Mpazi', 'Victorious'],
    'Mumena': ['Mumena', 'Rwezamenyo', 'Taba'],
    'Rugarama': ['Gasharu', 'Kigarama', 'Rugarama']
  },
  Kimisagara: {
    'Kamuhoza': ['Agatare', 'Kamuhoza', 'Ubumwe'],
    'Katabaro': ['Gasharu', 'Katabaro', 'Mpazi'],
    'Kimisagara': ['Akagera', 'Kamuhoza', 'Katabaro', 'Kimisagara']
  },
  Gitega: {
    'Akabahizi': ['Akabahizi', 'Gihanga', 'Mpazi'],
    'Akanyirandoli': ['Akanyirandoli', 'Kigarama', 'Rebero'],
    'Gakurazo': ['Gakurazo', 'Murambi', 'Urugwiro'],
    'Kora': ['Kora', 'Nyarurembo', 'Swahili']
  },
  Nyakabanda: {
    'Nyakabanda I': ['Gasiza', 'Munanira', 'Nyakabanda'],
    'Nyakabanda II': ['Kanyange', 'Rwambogo', 'Ubumwe']
  },
  Rwezamenyo: {
    'Rwezamenyo I': ['Abatarushwa', 'Intwari', 'Rwezamenyo'],
    'Rwezamenyo II': ['Biryogo', 'Muhoza', 'Umubano']
  },
  Kanyinya: {
    'Nyamweru': ['Gasharu', 'Nyamweru', 'Rebero'],
    'Nzove': ['Bibungo', 'Nzove', 'Ruyenzi'],
    'Taba': ['Agatare', 'Taba', 'Urumuri']
  },
  Kigali: {
    'Kigali': ['Kigali', 'Kadobogo', 'Nyabugogo'],
    'Mwendo': ['Gasharu', 'Mwendo', 'Rugarama'],
    'Nyabugogo': ['Giticyinyoni', 'Nyabugogo', 'Ubumwe']
  },
  Mageragere: {
    'Butamwa': ['Butamwa', 'Gasharu', 'Kigabiro'],
    'Kavumu': ['Kavumu', 'Murambi', 'Rebero'],
    'Kankuba': ['Kankuba', 'Nyarufunzo', 'Urugwiro'],
    'Mataba': ['Mataba', 'Nyarubuye', 'Taba'],
    'Nyarufunzo': ['Gatare', 'Nyarufunzo', 'Rebero'],
    'Nyarurenzi': ['Maya', 'Nyarurenzi', 'Rugendabari'],
    'Runzenze': ['Kabeza', 'Runzenze', 'Ubumwe']
  },

  // ── MUSANZE (Northern) ──
  Muhoza: {
    'Cyabararika': ['Cyabararika', 'Karisimbi', 'Muhoza'],
    'Mpenge': ['Mpenge', 'Ruhengeri', 'Susa'],
    'Ruhengeri': ['Gashangiro', 'Ruhengeri Ville', 'Ubumwe']
  },
  Cyuve: {
    'Bukanya': ['Bukanya', 'Gasharu', 'Rebero'],
    'Buramira': ['Buramira', 'Kabeza', 'Rugarama'],
    'Kabeza': ['Kabeza', 'Karisimbi', 'Urugwiro'],
    'Rwebeya': ['Murambi', 'Rwebeya', 'Susa']
  },
  Kinigi: {
    'Bisoke': ['Bisoke', 'Gasharu', 'Karisimbi'],
    'Kaguhu': ['Kaguhu', 'Kinigi', 'Nyange'],
    'Nyabigoma': ['Murambi', 'Nyabigoma', 'Sabyinyo'],
    'Sabyinyo': ['Gahinga', 'Karisimbi', 'Sabyinyo']
  },

  // ── RUBAVU (Western) ──
  Gisenyi: {
    'Amahoro': ['Amahoro', 'BSc', 'Gisenyi Ville'],
    'Bugoyi': ['Bugoyi', 'Mbugangari', 'Paradis'],
    'Kivumu': ['Kivumu', 'Rebero', 'Umuganda'],
    'Mbugangari': ['Kageyo', 'Mbugangari', 'Rugerero'],
    'Rubavu': ['Murambi', 'Rubavu', 'Urugwiro']
  },
  Rubavu: {
    'Burinda': ['Burinda', 'Gasharu', 'Rebero'],
    'Buhuru': ['Buhuru', 'Kanyefurwe', 'Rukoko'],
    'Murambi': ['Kabeza', 'Murambi', 'Rubavu'],
    'Rukoko': ['Gisenyi View', 'Rukoko', 'Ubumwe']
  },
  Rugerero: {
    'Gisa': ['Gisa', 'Murambi', 'Rebero'],
    'Kabilizi': ['Kabilizi', 'Nyakiriba', 'Urugwiro'],
    'Muhira': ['Gasharu', 'Muhira', 'Rugerero'],
    'Rukoko': ['Kanyefurwe', 'Rukoko', 'Ubumwe']
  },

  // ── HUYE (Southern) ──
  Ngoma: {
    'Butare': ['Arabi', 'Butare Ville', 'Kabutare'],
    'Matyazo': ['Gasharu', 'Matyazo', 'Rebero'],
    'Kabutare': ['Kabutare', 'Murambi', 'Urugwiro']
  },
  Tumba: {
    'Cyarwa': ['Cyarwa', 'Rango A', 'Rango B'],
    'Gitwa': ['Gitwa', 'Kabeza', 'Rebero'],
    'Mpare': ['Mpare', 'Tumba', 'Ubumwe']
  },
  Mukura: {
    'Bukomeye': ['Bukomeye', 'Gasharu', 'Rebero'],
    'Buvumo': ['Buvumo', 'Mukura', 'Urugwiro'],
    'Rango': ['Rango I', 'Rango II', 'Rango III']
  },

  // ── RWAMAGANA (Eastern) ──
  Kigabiro: {
    'Bwinsanga': ['Bwinsanga', 'Gasharu', 'Rebero'],
    'Cyanya': ['Cyanya', 'Kigabiro Centre', 'Ubumwe'],
    'Nyagasenyi': ['Nyagasenyi', 'Sovu', 'Sibagire'],
    'Sibagire': ['Murambi', 'Sibagire', 'Urugwiro']
  },
  Muhazi: {
    'Byeza': ['Byeza', 'Gasharu', 'Muhazi View'],
    'Kabare': ['Kabare', 'Murambi', 'Rebero'],
    'Karambi': ['Karambi', 'Lake Muhazi', 'Urugwiro'],
    'Ntsinda': ['Ntsinda', 'Rukara', 'Ubumwe']
  },

  // ── BUGESERA (Eastern) ──
  Nyamata: {
    'Kanazi': ['Gasharu', 'Kanazi', 'Rebero'],
    'Maranyundo': ['Maranyundo', 'Nyamata Ville', 'Rugarama'],
    'Murama': ['Murama', 'Nyamata Centre', 'Urugwiro'],
    'Nyamata Ville': ['Kabeza', 'Nyamata Airport View', 'Ubumwe']
  },
  Gashora: {
    'Biryogo': ['Biryogo', 'Gashora', 'Lake Mirayi'],
    'Kagomasi': ['Kagomasi', 'Murambi', 'Rebero'],
    'Mwendo': ['Mwendo', 'Ramiro', 'Urugwiro']
  }
};

// District and sector approximate GPS centroid coordinates for auto-centering Leaflet map
export const RWANDA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Provinces
  'Kigali City': { lat: -1.9441, lng: 30.0619 },
  'Eastern Province': { lat: -1.9487, lng: 30.4347 },
  'Northern Province': { lat: -1.4998, lng: 29.6349 },
  'Southern Province': { lat: -2.5967, lng: 29.7394 },
  'Western Province': { lat: -1.6744, lng: 29.2664 },

  // Kigali Districts
  'Gasabo': { lat: -1.9167, lng: 30.1333 },
  'Kicukiro': { lat: -1.9833, lng: 30.1000 },
  'Nyarugenge': { lat: -1.9536, lng: 30.0578 },

  // Kigali Sectors (Gasabo)
  'Remera': { lat: -1.9583, lng: 30.1111 },
  'Kimironko': { lat: -1.9483, lng: 30.1264 },
  'Kacyiru': { lat: -1.9365, lng: 30.0821 },
  'Kimihurura': { lat: -1.9542, lng: 30.0847 },
  'Gisozi': { lat: -1.9214, lng: 30.0645 },
  'Kinyinya': { lat: -1.9142, lng: 30.0931 },
  'Bumbogo': { lat: -1.8906, lng: 30.1472 },
  'Gatsata': { lat: -1.9208, lng: 30.0458 },
  'Jabana': { lat: -1.8667, lng: 30.0500 },
  'Jali': { lat: -1.8833, lng: 30.0167 },
  'Ndera': { lat: -1.9556, lng: 30.1833 },
  'Nduba': { lat: -1.8500, lng: 30.1000 },
  'Rusororo': { lat: -1.9667, lng: 30.2167 },
  'Rutunga': { lat: -1.8167, lng: 30.1833 },
  'Gikomero': { lat: -1.8500, lng: 30.2167 },

  // Kigali Sectors (Kicukiro)
  'Niboye': { lat: -1.9800, lng: 30.1050 },
  'Kanombe': { lat: -1.9722, lng: 30.1417 },
  'Gikondo': { lat: -1.9700, lng: 30.0750 },
  'Kagarama': { lat: -1.9950, lng: 30.0900 },
  'Gatenga': { lat: -1.9850, lng: 30.0800 },
  'Gahanga': { lat: -2.0300, lng: 30.1000 },
  'Masaka': { lat: -2.0000, lng: 30.1900 },
  'Kigarama': { lat: -1.9700, lng: 30.0900 },
  'Nyarugunga': { lat: -1.9900, lng: 30.1500 },

  // Kigali Sectors (Nyarugenge)
  'Muhima': { lat: -1.9417, lng: 30.0556 },
  'Nyamirambo': { lat: -1.9750, lng: 30.0450 },
  'Kimisagara': { lat: -1.9528, lng: 30.0444 },
  'Gitega': { lat: -1.9583, lng: 30.0500 },
  'Nyakabanda': { lat: -1.9667, lng: 30.0417 },
  'Rwezamenyo': { lat: -1.9639, lng: 30.0472 },
  'Kanyinya': { lat: -1.9000, lng: 30.0000 },
  'Kigali': { lat: -1.9667, lng: 30.0167 },
  'Mageragere': { lat: -2.0167, lng: 30.0167 },

  // Eastern Districts
  'Bugesera': { lat: -2.1464, lng: 30.0908 },
  'Nyamata': { lat: -2.1464, lng: 30.0908 },
  'Rwamagana': { lat: -1.9487, lng: 30.4347 },
  'Kigabiro': { lat: -1.9487, lng: 30.4347 },
  'Kayonza': { lat: -1.9333, lng: 30.5000 },
  'Gatsibo': { lat: -1.6000, lng: 30.4500 },
  'Nyagatare': { lat: -1.2972, lng: 30.3244 },
  'Ngoma': { lat: -2.1667, lng: 30.5333 },
  'Kirehe': { lat: -2.2667, lng: 30.6500 },

  // Northern Districts
  'Musanze': { lat: -1.4998, lng: 29.6349 },
  'Muhoza': { lat: -1.4998, lng: 29.6349 },
  'Kinigi': { lat: -1.4333, lng: 29.5833 },
  'Rulindo': { lat: -1.7333, lng: 30.0000 },
  'Gicumbi': { lat: -1.5764, lng: 30.0672 },
  'Burera': { lat: -1.4500, lng: 29.8000 },
  'Gakenke': { lat: -1.7000, lng: 29.7833 },

  // Southern Districts
  'Huye': { lat: -2.5967, lng: 29.7394 },
  'Muhanga': { lat: -2.0744, lng: 29.7567 },
  'Kamonyi': { lat: -1.9833, lng: 29.8833 },
  'Nyanza': { lat: -2.3500, lng: 29.7500 },
  'Ruhango': { lat: -2.2167, lng: 29.7833 },
  'Gisagara': { lat: -2.6167, lng: 29.8500 },
  'Nyamagabe': { lat: -2.4667, lng: 29.5667 },
  'Nyaruguru': { lat: -2.7167, lng: 29.5333 },

  // Western Districts
  'Rubavu': { lat: -1.6744, lng: 29.2664 },
  'Gisenyi': { lat: -1.6833, lng: 29.2667 },
  'Rusizi': { lat: -2.4844, lng: 28.9075 },
  'Karongi': { lat: -2.0600, lng: 29.3500 },
  'Rutsiro': { lat: -1.9333, lng: 29.3167 },
  'Nyabihu': { lat: -1.6500, lng: 29.5000 },
  'Ngororero': { lat: -1.8667, lng: 29.6333 },
  'Nyamasheke': { lat: -2.3500, lng: 29.1333 }
};

// ============================================================================
// FULL RWANDA DATASET ENGINE (ALL PROVINCES, DISTRICTS, SECTORS, CELLS, VILLAGES)
// Grounded in the official Rwandan Administrative Divisions dataset
// ============================================================================

const CACHE_KEY = 'rwanda_locations_db_v2';
const LOCAL_STATIC_URL = '/data/rwandaLocations.json';
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/ngabovictor/Rwanda/master/data.json';

let fullLocationsData: Record<string, any> | null = null;
let isFetching = false;

// Initialize from localStorage if already cached
if (typeof window !== 'undefined') {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        fullLocationsData = parsed;
      }
    }
  } catch {
    // localStorage unavailable or restricted
  }
}

/**
 * Triggers loading of the complete Rwanda locations dataset (all cells & villages)
 */
export const ensureFullDataLoading = async (): Promise<boolean> => {
  if (fullLocationsData) return true;
  if (isFetching || typeof window === 'undefined') return false;

  isFetching = true;

  try {
    let res: Response | null = null;
    try {
      res = await fetch(LOCAL_STATIC_URL);
      if (!res.ok) res = null;
    } catch {
      res = null;
    }

    if (!res) {
      res = await fetch(GITHUB_RAW_URL);
    }

    if (res && res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        fullLocationsData = data;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {
          // Ignore localStorage quota errors
        }
        window.dispatchEvent(new CustomEvent('rwanda_locations_updated'));
        return true;
      }
    }
  } catch (err) {
    console.warn('[rwandaLocations] Failed to load full dataset:', err);
  } finally {
    isFetching = false;
  }
  return false;
};

// Automatically initiate loading in browser
if (typeof window !== 'undefined') {
  ensureFullDataLoading();
}

export const isFullDataLoaded = (): boolean => fullLocationsData !== null;

/**
 * React hook to listen for dataset loading and trigger re-renders
 */
export const useRwandaLocations = () => {
  const [isLoaded, setIsLoaded] = useState(() => isFullDataLoaded());

  useEffect(() => {
    if (isLoaded) return;
    const handleUpdate = () => setIsLoaded(true);
    window.addEventListener('rwanda_locations_updated', handleUpdate);
    ensureFullDataLoading();
    return () => {
      window.removeEventListener('rwanda_locations_updated', handleUpdate);
    };
  }, [isLoaded]);

  return { isLoaded };
};

function normalizeProvinceKey(prov?: string): string | undefined {
  if (!prov) return undefined;
  const p = prov.toLowerCase().trim();
  if (p.includes('kigali')) return 'Kigali';
  if (p.includes('east')) return 'East';
  if (p.includes('north')) return 'North';
  if (p.includes('south')) return 'South';
  if (p.includes('west')) return 'West';
  return prov;
}

function findInTree(tree: any, key?: string): any {
  if (!tree || !key || typeof tree !== 'object') return undefined;
  if (tree[key] !== undefined) return tree[key];
  const lower = key.toLowerCase().trim();
  for (const k of Object.keys(tree)) {
    if (k.toLowerCase().trim() === lower) {
      return tree[k];
    }
  }
  return undefined;
}

function findDistrictObj(districtName: string, provinceName?: string): any {
  if (!fullLocationsData) return undefined;
  const normProv = normalizeProvinceKey(provinceName);
  if (normProv && fullLocationsData[normProv]) {
    const distObj = findInTree(fullLocationsData[normProv], districtName);
    if (distObj) return distObj;
  }
  for (const p of Object.keys(fullLocationsData)) {
    const distObj = findInTree(fullLocationsData[p], districtName);
    if (distObj) return distObj;
  }
  return undefined;
}

function findSectorObj(sectorName: string, districtName?: string, provinceName?: string): any {
  if (!fullLocationsData) return undefined;
  if (districtName) {
    const distObj = findDistrictObj(districtName, provinceName);
    if (distObj) {
      const secObj = findInTree(distObj, sectorName);
      if (secObj) return secObj;
    }
  }
  for (const p of Object.keys(fullLocationsData)) {
    const provObj = fullLocationsData[p];
    if (typeof provObj === 'object') {
      for (const d of Object.keys(provObj)) {
        const distObj = provObj[d];
        if (typeof distObj === 'object') {
          const secObj = findInTree(distObj, sectorName);
          if (secObj) return secObj;
        }
      }
    }
  }
  return undefined;
}

export const getProvinces = (): string[] => RWANDA_LOCATIONS.map((p) => p.name);

export const getDistrictsByProvince = (provinceName: string): string[] => {
  if (!provinceName) return [];

  if (fullLocationsData) {
    const normProv = normalizeProvinceKey(provinceName);
    if (normProv && fullLocationsData[normProv]) {
      const dists = Object.keys(fullLocationsData[normProv]);
      if (dists.length > 0) return dists.sort((a, b) => a.localeCompare(b));
    }
  }

  const prov = RWANDA_LOCATIONS.find((p) => p.name.toLowerCase() === provinceName.toLowerCase());
  return prov ? prov.districts.map((d) => d.name) : [];
};

export const getSectorsByDistrict = (districtName: string, provinceName?: string): string[] => {
  if (!districtName) return [];

  if (fullLocationsData) {
    const distObj = findDistrictObj(districtName, provinceName);
    if (distObj && typeof distObj === 'object') {
      const secs = Object.keys(distObj);
      if (secs.length > 0) return secs.sort((a, b) => a.localeCompare(b));
    }
  }

  for (const prov of RWANDA_LOCATIONS) {
    const dist = prov.districts.find((d) => d.name.toLowerCase() === districtName.toLowerCase());
    if (dist) return dist.sectors;
  }
  return [];
};

/**
 * Returns all official cells for a sector. Uses full GitHub dataset when available,
 * falling back to static mapping.
 */
export const getCellsBySector = (
  sectorName: string,
  districtName?: string,
  provinceName?: string
): string[] => {
  if (!sectorName) return [];

  // Query full dataset first
  const secObj = findSectorObj(sectorName, districtName, provinceName);
  if (secObj && typeof secObj === 'object' && !Array.isArray(secObj)) {
    const cells = Object.keys(secObj);
    if (cells.length > 0) {
      return cells.sort((a, b) => a.localeCompare(b));
    }
  }

  // Fallback to static SECTOR_CELLS_VILLAGES
  const matchedKey = Object.keys(SECTOR_CELLS_VILLAGES).find(
    (k) => k.toLowerCase() === sectorName.toLowerCase()
  );
  if (matchedKey) {
    return Object.keys(SECTOR_CELLS_VILLAGES[matchedKey]).sort((a, b) => a.localeCompare(b));
  }

  return [];
};

/**
 * Returns all official villages for a cell. Uses full GitHub dataset when available,
 * falling back to static mapping.
 */
export const getVillagesByCell = (
  cellName: string,
  sectorName?: string,
  districtName?: string,
  provinceName?: string
): string[] => {
  if (!cellName) return [];

  // Query full dataset first
  if (sectorName) {
    const secObj = findSectorObj(sectorName, districtName, provinceName);
    if (secObj && typeof secObj === 'object') {
      const villList = findInTree(secObj, cellName);
      if (Array.isArray(villList) && villList.length > 0) {
        return [...villList].sort((a, b) => a.localeCompare(b));
      }
    }
  } else if (fullLocationsData) {
    // Search across all sectors
    for (const p of Object.keys(fullLocationsData)) {
      for (const d of Object.keys(fullLocationsData[p])) {
        for (const s of Object.keys(fullLocationsData[p][d])) {
          const villList = findInTree(fullLocationsData[p][d][s], cellName);
          if (Array.isArray(villList) && villList.length > 0) {
            return [...villList].sort((a, b) => a.localeCompare(b));
          }
        }
      }
    }
  }

  // Fallback to static SECTOR_CELLS_VILLAGES
  if (sectorName) {
    const matchedSector = Object.keys(SECTOR_CELLS_VILLAGES).find(
      (k) => k.toLowerCase() === sectorName.toLowerCase()
    );
    if (matchedSector) {
      const sectorObj = SECTOR_CELLS_VILLAGES[matchedSector];
      const matchedCell = Object.keys(sectorObj).find(
        (c) => c.toLowerCase() === cellName.toLowerCase()
      );
      if (matchedCell && Array.isArray(sectorObj[matchedCell])) {
        return [...sectorObj[matchedCell]].sort((a, b) => a.localeCompare(b));
      }
    }
  }

  return [];
};

/**
 * Returns GPS coordinates for a given administrative hierarchy,
 * following down through Province -> District -> Sector -> Cell -> Village.
 * Returns [lat, lng] array with additional .lat, .lng, and .zoom properties.
 */
export const getLocationCoordinates = (
  province?: string,
  district?: string,
  sector?: string,
  cell?: string,
  village?: string
): [number, number] & { lat: number; lng: number; zoom: number } => {
  let lat = -1.9441;
  let lng = 30.0619;
  let zoom = 10;

  const findCoord = (name?: string) => {
    if (!name) return null;
    const key = Object.keys(RWANDA_COORDINATES).find(
      (k) => k.toLowerCase() === name.trim().toLowerCase()
    );
    return key ? RWANDA_COORDINATES[key] : null;
  };

  // 1. Province level
  const provCoord = findCoord(province);
  if (provCoord) {
    lat = provCoord.lat;
    lng = provCoord.lng;
    zoom = 10;
  }

  // 2. District level
  const distCoord = findCoord(district);
  if (distCoord) {
    lat = distCoord.lat;
    lng = distCoord.lng;
    zoom = 12;
  }

  // 3. Sector level
  const secCoord = findCoord(sector);
  if (secCoord) {
    lat = secCoord.lat;
    lng = secCoord.lng;
    zoom = 14;
  } else if (sector && district) {
    // Sector not in explicit coordinates list -> deterministic distribution around district centroid
    const sectors = getSectorsByDistrict(district, province);
    const secIdx = sectors.findIndex((s) => s.toLowerCase() === sector.trim().toLowerCase());
    const sHash = sector.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const idx = secIdx >= 0 ? secIdx : sHash % 10;
    const count = Math.max(sectors.length, 6);
    const angle = (2 * Math.PI * idx) / count + 0.45;
    const radius = 0.052; // ~5.8 km from district center
    lat = lat + radius * Math.sin(angle);
    lng = lng + radius * Math.cos(angle);
    zoom = 14;
  }

  // 4. Cell level
  if (cell) {
    const cellCoord = findCoord(cell);
    if (cellCoord) {
      lat = cellCoord.lat;
      lng = cellCoord.lng;
      zoom = 15;
    } else {
      const cells = sector ? getCellsBySector(sector, district, province) : [];
      const cellIdx = cells.findIndex((c) => c.toLowerCase() === cell.trim().toLowerCase());
      const cHash = cell.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const idx = cellIdx >= 0 ? cellIdx : cHash % 6;
      const count = Math.max(cells.length, 4);
      const angle = (2 * Math.PI * idx) / count + 0.35;
      const radius = 0.009; // ~1 km from sector center
      lat = lat + radius * Math.sin(angle);
      lng = lng + radius * Math.cos(angle);
      zoom = 15;
    }
  }

  // 5. Village level
  if (village) {
    const villCoord = findCoord(village);
    if (villCoord) {
      lat = villCoord.lat;
      lng = villCoord.lng;
      zoom = 16;
    } else {
      const villages = cell ? getVillagesByCell(cell, sector, district, province) : [];
      const villIdx = villages.findIndex((v) => v.toLowerCase() === village.trim().toLowerCase());
      const vHash = village.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const idx = villIdx >= 0 ? villIdx : vHash % 5;
      const count = Math.max(villages.length, 4);
      const angle = (2 * Math.PI * idx) / count + 0.65;
      const radius = 0.0028; // ~300 meters from cell center
      lat = lat + radius * Math.sin(angle);
      lng = lng + radius * Math.cos(angle);
      zoom = 16;
    }
  }

  lat = parseFloat(lat.toFixed(6));
  lng = parseFloat(lng.toFixed(6));

  const result: any = [lat, lng];
  result.lat = lat;
  result.lng = lng;
  result.zoom = zoom;
  return result;
};
