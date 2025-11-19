export interface BuildingData {
  position: [number, number, number];
  size: [number, number, number];
  type: 'residential' | 'commercial' | 'office' | 'restaurant';
  color: string;
  address: string;
  entrance?: [number, number, number];
}

export interface StreetData {
  name: string;
  axis: 'x' | 'z';
  coordinate: number;
}

export const MAP_BOUNDS = {
  minX: -100,
  maxX: 100,
  minZ: -100,
  maxZ: 100
};

export const CITY_CONFIG = {
  gridSize: 6,
  blockSize: 30,
  roadWidth: 8
};

const STREET_NAMES = [
  'Невский проспект',
  'Тверская улица', 
  'Ленинградское шоссе',
  'Садовая улица',
  'Мясницкая улица',
  'Покровка',
  'Пречистенка',
  'Остоженка',
  'Петровка',
  'Кузнецкий мост',
  'Большая Дмитровка',
  'Маросейка'
];

export function generateStreets(): StreetData[] {
  const streets: StreetData[] = [];
  const { gridSize, blockSize } = CITY_CONFIG;
  let nameIndex = 0;
  
  for (let i = -gridSize; i <= gridSize; i++) {
    const coord = i * blockSize;
    
    streets.push({
      name: STREET_NAMES[nameIndex % STREET_NAMES.length],
      axis: 'x',
      coordinate: coord
    });
    nameIndex++;
    
    streets.push({
      name: STREET_NAMES[nameIndex % STREET_NAMES.length],
      axis: 'z',
      coordinate: coord
    });
    nameIndex++;
  }
  
  return streets;
}

export function generateCityBuildings(): BuildingData[] {
  const buildingsList: BuildingData[] = [];
  const streets = generateStreets();
  
  const { gridSize, blockSize, roadWidth } = CITY_CONFIG;
  
  for (let x = -gridSize; x < gridSize; x++) {
    for (let z = -gridSize; z < gridSize; z++) {
      const centerX = x * blockSize + blockSize / 2;
      const centerZ = z * blockSize + blockSize / 2;
      
      const numBuildings = 1;
      
      for (let b = 0; b < numBuildings; b++) {
        const offsetX = (Math.random() - 0.5) * (blockSize - roadWidth - 10);
        const offsetZ = (Math.random() - 0.5) * (blockSize - roadWidth - 10);
        
        const width = Math.random() * 8 + 6;
        const depth = Math.random() * 8 + 6;
        const height = Math.random() * 25 + 15;
        
        const types: Array<'residential' | 'commercial' | 'office' | 'restaurant'> = 
          ['residential', 'commercial', 'office', 'restaurant'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const colors = {
          residential: '#E8D5C4',
          commercial: '#D4E8F0',
          office: '#F0E8D4',
          restaurant: '#FFE8D4'
        };
        
        const buildingX = centerX + offsetX;
        const buildingZ = centerZ + offsetZ;
        
        const nearestXStreet = streets.find(s => s.axis === 'z' && Math.abs(s.coordinate - centerX) < blockSize / 2);
        const nearestZStreet = streets.find(s => s.axis === 'x' && Math.abs(s.coordinate - centerZ) < blockSize / 2);
        
        const streetName = nearestXStreet?.name || nearestZStreet?.name || 'Неизвестная улица';
        const buildingNumber = Math.floor(Math.random() * 100) + 1;
        
        const entranceX = buildingX;
        const entranceZ = buildingZ - depth / 2 - 0.5;
        
        buildingsList.push({
          position: [buildingX, height / 2, buildingZ],
          size: [width, height, depth],
          type,
          color: colors[type],
          address: `${streetName}, ${buildingNumber}`,
          entrance: [entranceX, 0.2, entranceZ]
        });
      }
    }
  }
  
  return buildingsList;
}

export function isPositionInBounds(x: number, z: number): boolean {
  return x >= MAP_BOUNDS.minX && x <= MAP_BOUNDS.maxX &&
         z >= MAP_BOUNDS.minZ && z <= MAP_BOUNDS.maxZ;
}

export function clampPositionToBounds(x: number, z: number): { x: number; z: number } {
  return {
    x: Math.max(MAP_BOUNDS.minX, Math.min(MAP_BOUNDS.maxX, x)),
    z: Math.max(MAP_BOUNDS.minZ, Math.min(MAP_BOUNDS.maxZ, z))
  };
}
