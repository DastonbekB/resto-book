export interface District {
  id: string;
  name: string;
  nameUz: string;
}

export interface Region {
  id: string;
  name: string;
  nameUz: string;
  districts: District[];
}

export const uzbekistanRegions: Region[] = [
  {
    id: "tashkent-city",
    name: "Tashkent City",
    nameUz: "Toshkent shahri",
    districts: [
      { id: "bektemir", name: "Bektemir", nameUz: "Bektemir" },
      { id: "chilanzar", name: "Chilanzar", nameUz: "Chilonzor" },
      { id: "hamza", name: "Hamza", nameUz: "Hamza" },
      { id: "mirobod", name: "Mirobod", nameUz: "Mirobod" },
      { id: "mirzo-ulugbek", name: "Mirzo Ulugbek", nameUz: "Mirzo Ulug'bek" },
      { id: "olmazor", name: "Olmazor", nameUz: "Olmazor" },
      { id: "sergeli", name: "Sergeli", nameUz: "Sergeli" },
      { id: "shaykhontohur", name: "Shaykhontohur", nameUz: "Shayxontohur" },
      { id: "uchtepa", name: "Uchtepa", nameUz: "Uchtepa" },
      { id: "yakkasaray", name: "Yakkasaray", nameUz: "Yakkasaroy" },
      { id: "yashnobod", name: "Yashnobod", nameUz: "Yashnobod" },
      { id: "yunusabad", name: "Yunusabad", nameUz: "Yunusobod" },
    ],
  },
  {
    id: "tashkent-region",
    name: "Tashkent Region",
    nameUz: "Toshkent viloyati",
    districts: [
      { id: "bekabad", name: "Bekabad", nameUz: "Bekobod" },
      { id: "bostanliq", name: "Bostanliq", nameUz: "Boʻstonliq" },
      { id: "chinaz", name: "Chinaz", nameUz: "Chinoz" },
      { id: "qibray", name: "Qibray", nameUz: "Qibray" },
      { id: "oqqorgon", name: "Oqqo'rg'on", nameUz: "Oqqoʻrgʻon" },
      { id: "ohangaron", name: "Ohangaron", nameUz: "Ohangaron" },
      { id: "parkent", name: "Parkent", nameUz: "Parkent" },
      { id: "piskent", name: "Piskent", nameUz: "Piskent" },
      { id: "quyi-chirchiq", name: "Quyi Chirchiq", nameUz: "Quyi Chirchiq" },
      { id: "tashkent", name: "Tashkent", nameUz: "Toshkent" },
      { id: "yangiyo'l", name: "Yangiyo'l", nameUz: "Yangiyoʻl" },
      {
        id: "yuqori-chirchiq",
        name: "Yuqori Chirchiq",
        nameUz: "Yuqori Chirchiq",
      },
      { id: "zangiota", name: "Zangiota", nameUz: "Zangiota" },
    ],
  },
  {
    id: "andijan",
    name: "Andijan Region",
    nameUz: "Andijon viloyati",
    districts: [
      { id: "andijan-city", name: "Andijan City", nameUz: "Andijon shahri" },
      { id: "asaka", name: "Asaka", nameUz: "Asaka" },
      { id: "balichі", name: "Baliqchi", nameUz: "Baliqchi" },
      { id: "bo'z", name: "Bo'z", nameUz: "Boʻz" },
      { id: "buloqboshi", name: "Buloqboshi", nameUz: "Buloqboshi" },
      { id: "izboskan", name: "Izboskan", nameUz: "Izboskan" },
      { id: "jalaquduq", name: "Jalaquduq", nameUz: "Jalaquduq" },
      { id: "marhamat", name: "Marhamat", nameUz: "Marhamat" },
      { id: "oltinko'l", name: "Oltinko'l", nameUz: "Oltinkoʻl" },
      { id: "paxtaobod", name: "Paxtaobod", nameUz: "Paxtaobod" },
      { id: "qo'rg'ontepa", name: "Qo'rg'ontepa", nameUz: "Qoʻrgʻontepa" },
      { id: "shahrixon", name: "Shahrixon", nameUz: "Shahrixon" },
      { id: "ulugnor", name: "Ulugnor", nameUz: "Ulugnor" },
      { id: "xo'jaobod", name: "Xo'jaobod", nameUz: "Xoʻjaobod" },
    ],
  },
  {
    id: "bukhara",
    name: "Bukhara Region",
    nameUz: "Buxoro viloyati",
    districts: [
      { id: "bukhara-city", name: "Bukhara City", nameUz: "Buxoro shahri" },
      { id: "alat", name: "Alat", nameUz: "Olot" },
      { id: "bukhara", name: "Bukhara", nameUz: "Buxoro" },
      { id: "gijduvan", name: "Gijduvan", nameUz: "Gijduvon" },
      { id: "jondor", name: "Jondor", nameUz: "Jondor" },
      { id: "kagan", name: "Kagan", nameUz: "Kogon" },
      { id: "karakul", name: "Karakul", nameUz: "Qorako'l" },
      { id: "karaulbazar", name: "Karaulbazar", nameUz: "Qorovulbozor" },
      { id: "peshku", name: "Peshku", nameUz: "Peshku" },
      { id: "romitan", name: "Romitan", nameUz: "Romitan" },
      { id: "shofirkon", name: "Shofirkon", nameUz: "Shofirkon" },
      { id: "vobkent", name: "Vobkent", nameUz: "Vobkent" },
    ],
  },
  {
    id: "fergana",
    name: "Fergana Region",
    nameUz: "Farg'ona viloyati",
    districts: [
      { id: "fergana-city", name: "Fergana City", nameUz: "Fargʻona shahri" },
      { id: "oltiariq", name: "Oltiariq", nameUz: "Oltiariq" },
      { id: "bag'dod", name: "Bag'dod", nameUz: "Bagʻdod" },
      { id: "beshariq", name: "Beshariq", nameUz: "Beshariq" },
      { id: "buvayda", name: "Buvayda", nameUz: "Buvayda" },
      { id: "dang'ara", name: "Dang'ara", nameUz: "Dangʻara" },
      { id: "fergana", name: "Fergana", nameUz: "Fargʻona" },
      { id: "furkat", name: "Furkat", nameUz: "Furkat" },
      { id: "qo'shtepa", name: "Qo'shtepa", nameUz: "Qoʻshtepa" },
      { id: "quva", name: "Quva", nameUz: "Quva" },
      { id: "rishton", name: "Rishton", nameUz: "Rishton" },
      { id: "so'x", name: "So'x", nameUz: "Soʻx" },
      { id: "toshloq", name: "Toshloq", nameUz: "Toshloq" },
      { id: "uchko'prik", name: "Uchko'prik", nameUz: "Uchkoʻprik" },
      { id: "o'zbekiston", name: "O'zbekiston", nameUz: "Oʻzbekiston" },
      { id: "yozyovon", name: "Yozyovon", nameUz: "Yozyovon" },
    ],
  },
  {
    id: "jizzakh",
    name: "Jizzakh Region",
    nameUz: "Jizzax viloyati",
    districts: [
      { id: "jizzakh-city", name: "Jizzakh City", nameUz: "Jizzax shahri" },
      { id: "arnasoy", name: "Arnasoy", nameUz: "Arnasoy" },
      { id: "bakhtiyor", name: "Bakhtiyor", nameUz: "Baxtiyor" },
      { id: "gallaorol", name: "Gallaorol", nameUz: "G'allaorol" },
      {
        id: "sharof-rashidov",
        name: "Sharof Rashidov",
        nameUz: "Sharof Rashidov",
      },
      { id: "mirzachul", name: "Mirzachul", nameUz: "Mirzacho'l" },
      { id: "paxtakor", name: "Paxtakor", nameUz: "Paxtakor" },
      { id: "yangiobod", name: "Yangiobod", nameUz: "Yangiobod" },
      { id: "zafarobod", name: "Zafarobod", nameUz: "Zafarobod" },
      { id: "zarbdor", name: "Zarbdor", nameUz: "Zarbdor" },
      { id: "zomin", name: "Zomin", nameUz: "Zomin" },
      { id: "dustlik", name: "Dustlik", nameUz: "Do'stlik" },
    ],
  },
  {
    id: "kashkadarya",
    name: "Kashkadarya Region",
    nameUz: "Qashqadaryo viloyati",
    districts: [
      { id: "karshi-city", name: "Karshi City", nameUz: "Qarshi shahri" },
      { id: "chiroqchi", name: "Chiroqchi", nameUz: "Chiroqchi" },
      { id: "dehqonobod", name: "Dehqonobod", nameUz: "Dehqonobod" },
      { id: "guzar", name: "Guzar", nameUz: "G'uzor" },
      { id: "qamashi", name: "Qamashi", nameUz: "Qamashi" },
      { id: "qarshi", name: "Qarshi", nameUz: "Qarshi" },
      { id: "kasbi", name: "Kasbi", nameUz: "Kasbi" },
      { id: "kitob", name: "Kitob", nameUz: "Kitob" },
      { id: "koson", name: "Koson", nameUz: "Koson" },
      { id: "mirishkor", name: "Mirishkor", nameUz: "Mirishkor" },
      { id: "muborak", name: "Muborak", nameUz: "Muborak" },
      { id: "nishon", name: "Nishon", nameUz: "Nishon" },
      { id: "shahrisabz", name: "Shahrisabz", nameUz: "Shahrisabz" },
      { id: "yakkabog'", name: "Yakkabog'", nameUz: "Yakkabogʻ" },
    ],
  },
  {
    id: "khorezm",
    name: "Khorezm Region",
    nameUz: "Xorazm viloyati",
    districts: [
      { id: "urgench-city", name: "Urgench City", nameUz: "Urganch shahri" },
      { id: "bagat", name: "Bagat", nameUz: "Bog'ot" },
      { id: "gurlen", name: "Gurlen", nameUz: "Gurlan" },
      { id: "qo'shko'pir", name: "Qo'shko'pir", nameUz: "Qoʻshkoʻpir" },
      { id: "shovot", name: "Shovot", nameUz: "Shovot" },
      { id: "urganch", name: "Urganch", nameUz: "Urganch" },
      { id: "xiva", name: "Xiva", nameUz: "Xiva" },
      { id: "xonqa", name: "Xonqa", nameUz: "Xonqa" },
      { id: "yangiariq", name: "Yangiariq", nameUz: "Yangiariq" },
      { id: "yangibozor", name: "Yangibozor", nameUz: "Yangibozor" },
    ],
  },
  {
    id: "namangan",
    name: "Namangan Region",
    nameUz: "Namangan viloyati",
    districts: [
      { id: "namangan-city", name: "Namangan City", nameUz: "Namangan shahri" },
      { id: "chust", name: "Chust", nameUz: "Chust" },
      { id: "kosonsoy", name: "Kosonsoy", nameUz: "Kosonsoy" },
      { id: "mingbuloq", name: "Mingbuloq", nameUz: "Mingbuloq" },
      { id: "namangan", name: "Namangan", nameUz: "Namangan" },
      { id: "norin", name: "Norin", nameUz: "Norin" },
      { id: "pop", name: "Pop", nameUz: "Pop" },
      { id: "to'raqo'rg'on", name: "To'raqo'rg'on", nameUz: "Toʻraqoʻrgʻon" },
      { id: "uchqo'rg'on", name: "Uchqo'rg'on", nameUz: "Uchqoʻrgʻon" },
      { id: "uychi", name: "Uychi", nameUz: "Uychi" },
      { id: "yangiqo'rg'on", name: "Yangiqo'rg'on", nameUz: "Yangiqoʻrgʻon" },
    ],
  },
  {
    id: "navoi",
    name: "Navoi Region",
    nameUz: "Navoiy viloyati",
    districts: [
      { id: "navoi-city", name: "Navoi City", nameUz: "Navoiy shahri" },
      { id: "konimex", name: "Konimex", nameUz: "Konimex" },
      { id: "karmana", name: "Karmana", nameUz: "Karmana" },
      { id: "navbahor", name: "Navbahor", nameUz: "Navbahor" },
      { id: "nurota", name: "Nurota", nameUz: "Nurota" },
      { id: "qiziltepa", name: "Qiziltepa", nameUz: "Qiziltepa" },
      { id: "tomdi", name: "Tomdi", nameUz: "Tomdi" },
      { id: "uchquduq", name: "Uchquduq", nameUz: "Uchquduq" },
      { id: "xatirchi", name: "Xatirchi", nameUz: "Xatirchi" },
    ],
  },
  {
    id: "samarkand",
    name: "Samarkand Region",
    nameUz: "Samarqand viloyati",
    districts: [
      {
        id: "samarkand-city",
        name: "Samarkand City",
        nameUz: "Samarqand shahri",
      },
      { id: "bulungur", name: "Bulungur", nameUz: "Bulung'ur" },
      { id: "ishtixon", name: "Ishtixon", nameUz: "Ishtixon" },
      { id: "jomboy", name: "Jomboy", nameUz: "Jomboy" },
      { id: "kattaqo'rg'on", name: "Kattaqo'rg'on", nameUz: "Kattaqoʻrgʻon" },
      { id: "narpay", name: "Narpay", nameUz: "Narpay" },
      { id: "nurobod", name: "Nurobod", nameUz: "Nurobod" },
      { id: "oqdaryo", name: "Oqdaryo", nameUz: "Oqdaryo" },
      { id: "payariq", name: "Payariq", nameUz: "Payariq" },
      { id: "pastdarg'om", name: "Pastdarg'om", nameUz: "Pastdargʻom" },
      { id: "samarkand", name: "Samarkand", nameUz: "Samarqand" },
      { id: "toyloq", name: "Toyloq", nameUz: "Toyloq" },
      { id: "urgut", name: "Urgut", nameUz: "Urgut" },
    ],
  },
  {
    id: "surkhandarya",
    name: "Surkhandarya Region",
    nameUz: "Surxondaryo viloyati",
    districts: [
      { id: "termez-city", name: "Termez City", nameUz: "Termiz shahri" },
      { id: "angor", name: "Angor", nameUz: "Angor" },
      { id: "bandixon", name: "Bandixon", nameUz: "Bandixon" },
      { id: "boysun", name: "Boysun", nameUz: "Boysun" },
      { id: "denov", name: "Denov", nameUz: "Denov" },
      { id: "jarkurgan", name: "Jarkurgan", nameUz: "Jarqo'rg'on" },
      { id: "qiziriq", name: "Qiziriq", nameUz: "Qiziriq" },
      { id: "qumqo'rg'on", name: "Qumqo'rg'on", nameUz: "Qumqoʻrgʻon" },
      { id: "muzrabot", name: "Muzrabot", nameUz: "Muzrabot" },
      { id: "oltinsoy", name: "Oltinsoy", nameUz: "Oltinsoy" },
      { id: "sariosiyo", name: "Sariosiyo", nameUz: "Sariosiyo" },
      { id: "sherobod", name: "Sherobod", nameUz: "Sherobod" },
      { id: "sho'rchi", name: "Sho'rchi", nameUz: "Shoʻrchi" },
      { id: "termez", name: "Termez", nameUz: "Termiz" },
      { id: "uzun", name: "Uzun", nameUz: "Uzun" },
    ],
  },
  {
    id: "sirdarya",
    name: "Sirdarya Region",
    nameUz: "Sirdaryo viloyati",
    districts: [
      { id: "guliston-city", name: "Guliston City", nameUz: "Guliston shahri" },
      { id: "boyovut", name: "Boyovut", nameUz: "Boyovut" },
      { id: "guliston", name: "Guliston", nameUz: "Guliston" },
      { id: "mirzaobod", name: "Mirzaobod", nameUz: "Mirzaobod" },
      { id: "oqoltin", name: "Oqoltin", nameUz: "Oqoltin" },
      { id: "sardoba", name: "Sardoba", nameUz: "Sardoba" },
      { id: "sayxunobod", name: "Sayxunobod", nameUz: "Sayxunobod" },
      { id: "sirdaryo", name: "Sirdaryo", nameUz: "Sirdaryo" },
    ],
  },
  {
    id: "karakalpakstan",
    name: "Republic of Karakalpakstan",
    nameUz: "Qoraqalpog'iston Respublikasi",
    districts: [
      { id: "nukus-city", name: "Nukus City", nameUz: "Nukus shahri" },
      { id: "amudaryo", name: "Amudaryo", nameUz: "Amudaryo" },
      { id: "beruniy", name: "Beruniy", nameUz: "Beruniy" },
      { id: "bo'zatov", name: "Bo'zatov", nameUz: "Boʻzatov" },
      { id: "chimboy", name: "Chimboy", nameUz: "Chimboy" },
      { id: "ellikqala", name: "Ellikqala", nameUz: "Ellikqala" },
      { id: "kegeyli", name: "Kegeyli", nameUz: "Kegeyli" },
      { id: "mo'ynoq", name: "Mo'ynoq", nameUz: "Moʻynoq" },
      { id: "nukus", name: "Nukus", nameUz: "Nukus" },
      { id: "qanliko'l", name: "Qanliko'l", nameUz: "Qanlikoʻl" },
      { id: "qorao'zak", name: "Qorao'zak", nameUz: "Qoraoʻzak" },
      { id: "shumanay", name: "Shumanay", nameUz: "Shumanay" },
      { id: "taxtako'pir", name: "Taxtako'pir", nameUz: "Taxtakoʻpir" },
      { id: "to'rtko'l", name: "To'rtko'l", nameUz: "Toʻrtkoʻl" },
      { id: "xo'jayli", name: "Xo'jayli", nameUz: "Xoʻjayli" },
    ],
  },
];

// Helper functions
export function getRegionById(regionId: string): Region | undefined {
  return uzbekistanRegions.find((region) => region.id === regionId);
}

export function getDistrictById(
  regionId: string,
  districtId: string
): District | undefined {
  const region = getRegionById(regionId);
  return region?.districts.find((district) => district.id === districtId);
}

export function getDistrictsByRegion(regionId: string): District[] {
  const region = getRegionById(regionId);
  return region?.districts || [];
}

export function formatFullAddress(
  regionId: string,
  districtId: string,
  address?: string
): string {
  const region = getRegionById(regionId);
  const district = getDistrictById(regionId, districtId);

  if (!region || !district) {
    return address || "";
  }

  const parts = [];
  if (address) parts.push(address);
  parts.push(district.name);
  parts.push(region.name);

  return parts.join(", ");
}
