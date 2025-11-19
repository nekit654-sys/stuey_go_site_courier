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
  gridSize: 8,
  blockSize: 15,
  roadWidth: 5,
  spacing: 20
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
  const { spacing } = CITY_CONFIG;
  let nameIndex = 0;
  
  const roads = [-60, -40, -20, 0, 20, 40, 60];
  
  for (const coord of roads) {
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
  
  const { gridSize, spacing } = CITY_CONFIG;
  
  for (let row = -gridSize / 2; row < gridSize / 2; row++) {
    for (let col = -gridSize / 2; col < gridSize / 2; col++) {
      if (Math.abs(row) === 0 && Math.abs(col) === 0) continue;
      
      const x = col * spacing;
      const z = row * spacing;
      
      const width = 8 + Math.random() * 4;
      const depth = 8 + Math.random() * 4;
      const floors = 4 + Math.floor(Math.random() * 6);
      const height = floors * 3;
      
      const types: Array<'residential' | 'commercial' | 'office' | 'restaurant'> = 
        ['residential', 'residential', 'commercial', 'office', 'restaurant'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const colors = {
        residential: '#E8E8E8',
        commercial: '#D4E8F0',
        office: '#F0E6DC',
        restaurant: '#FFE8D4'
      };
      
      const nearestXStreet = streets.find(s => s.axis === 'z' && Math.abs(s.coordinate - x) < spacing);
      const nearestZStreet = streets.find(s => s.axis === 'x' && Math.abs(s.coordinate - z) < spacing);
      
      const streetName = nearestXStreet?.name || nearestZStreet?.name || 'Неизвестная улица';
      const buildingNumber = Math.floor(Math.abs(x + z)) + Math.floor(Math.random() * 50) + 1;
      
      const entranceX = x;
      const entranceZ = z - depth / 2 - 1;
      
      buildingsList.push({
        position: [x, height / 2, z],
        size: [width, height, depth],
        type,
        color: colors[type],
        address: `${streetName}, ${buildingNumber}`,
        entrance: [entranceX, 0, entranceZ]
      });
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