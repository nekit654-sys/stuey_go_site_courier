export interface BuildingData {
  position: [number, number, number];
  size: [number, number, number];
  type: 'residential' | 'commercial' | 'office';
  color: string;
}

export function generateCityBuildings(): BuildingData[] {
  const buildingsList: BuildingData[] = [];
  
  const gridSize = 6;
  const blockSize = 30;
  const roadWidth = 8;
  
  for (let x = -gridSize; x < gridSize; x++) {
    for (let z = -gridSize; z < gridSize; z++) {
      const centerX = x * blockSize + blockSize / 2;
      const centerZ = z * blockSize + blockSize / 2;
      
      const numBuildings = Math.floor(Math.random() * 1) + 1;
      
      for (let b = 0; b < numBuildings; b++) {
        const offsetX = (Math.random() - 0.5) * (blockSize - roadWidth - 8);
        const offsetZ = (Math.random() - 0.5) * (blockSize - roadWidth - 8);
        
        const width = Math.random() * 6 + 4;
        const depth = Math.random() * 6 + 4;
        const height = Math.random() * 20 + 10;
        
        const types: Array<'residential' | 'commercial' | 'office'> = ['residential', 'commercial', 'office'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const colors = {
          residential: '#E8D5C4',
          commercial: '#D4E8F0',
          office: '#F0E8D4'
        };
        
        buildingsList.push({
          position: [centerX + offsetX, height / 2, centerZ + offsetZ],
          size: [width, height, depth],
          type,
          color: colors[type]
        });
      }
    }
  }
  
  return buildingsList;
}
