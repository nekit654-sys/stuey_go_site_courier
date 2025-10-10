export const isFemale = (name: string): boolean => {
  const firstName = name.split(',')[0].trim().split(' ')[0];
  const femaleEndings = ['а', 'я', 'ь'];
  const maleExceptions = ['Никита', 'Илья'];
  
  if (maleExceptions.includes(firstName)) return false;
  
  return femaleEndings.some(ending => firstName.endsWith(ending));
};

export const generateAvatar = (name: string): string => {
  const firstName = name.split(',')[0].trim().split(' ')[0];
  const female = isFemale(name);
  
  const maleColors = [
    { bg: '2563eb', color: 'ffffff' },
    { bg: '7c3aed', color: 'ffffff' },
    { bg: '0891b2', color: 'ffffff' },
    { bg: '059669', color: 'ffffff' },
    { bg: 'dc2626', color: 'ffffff' },
    { bg: 'eab308', color: 'ffffff' },
    { bg: '4b5563', color: 'ffffff' },
    { bg: '0d9488', color: 'ffffff' },
  ];
  
  const femaleColors = [
    { bg: 'ec4899', color: 'ffffff' },
    { bg: 'a855f7', color: 'ffffff' },
    { bg: 'f43f5e', color: 'ffffff' },
    { bg: '8b5cf6', color: 'ffffff' },
    { bg: '06b6d4', color: 'ffffff' },
    { bg: '10b981', color: 'ffffff' },
    { bg: 'f59e0b', color: 'ffffff' },
    { bg: 'd946ef', color: 'ffffff' },
  ];
  
  const colors = female ? femaleColors : maleColors;
  const charCode = firstName.charCodeAt(0);
  const colorIndex = charCode % colors.length;
  const { bg, color } = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=${bg}&color=${color}&size=100&bold=true&font-size=0.4`;
};
