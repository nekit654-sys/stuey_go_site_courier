import * as THREE from 'three';

export interface CollisionBox {
  min: { x: number; z: number };
  max: { x: number; z: number };
}

export class CollisionSystem {
  private buildings: CollisionBox[] = [];
  private playerRadius = 0.5;

  setBuildingsFromCityMap(buildingsData: Array<{ position: [number, number, number]; size: [number, number, number] }>) {
    this.buildings = buildingsData.map(building => {
      const [x, , z] = building.position;
      const [width, , depth] = building.size;
      
      return {
        min: { x: x - width / 2, z: z - depth / 2 },
        max: { x: x + width / 2, z: z + depth / 2 }
      };
    });
    console.log(`🔲 Система коллизий: загружено ${this.buildings.length} зданий`);
  }

  checkPlayerCollision(newX: number, newZ: number): { x: number; z: number } {
    const playerBox = {
      min: { x: newX - this.playerRadius, z: newZ - this.playerRadius },
      max: { x: newX + this.playerRadius, z: newZ + this.playerRadius }
    };

    for (const building of this.buildings) {
      if (this.boxesIntersect(playerBox, building)) {
        return this.resolveCollision(newX, newZ, building);
      }
    }

    return { x: newX, z: newZ };
  }

  checkCameraCollision(cameraPos: THREE.Vector3, playerPos: THREE.Vector3): THREE.Vector3 {
    const direction = new THREE.Vector3().subVectors(cameraPos, playerPos);
    const distance = direction.length();
    direction.normalize();

    const steps = 20;
    const stepSize = distance / steps;

    for (let i = 1; i <= steps; i++) {
      const testPos = new THREE.Vector3().copy(playerPos).addScaledVector(direction, stepSize * i);
      
      for (const building of this.buildings) {
        if (this.pointInBox(testPos.x, testPos.z, building)) {
          const safeDistance = (i - 1) * stepSize;
          return new THREE.Vector3().copy(playerPos).addScaledVector(direction, safeDistance * 0.9);
        }
      }
    }

    return cameraPos;
  }

  private boxesIntersect(box1: CollisionBox, box2: CollisionBox): boolean {
    return (
      box1.min.x <= box2.max.x &&
      box1.max.x >= box2.min.x &&
      box1.min.z <= box2.max.z &&
      box1.max.z >= box2.min.z
    );
  }

  private pointInBox(x: number, z: number, box: CollisionBox): boolean {
    return x >= box.min.x && x <= box.max.x && z >= box.min.z && z <= box.max.z;
  }

  private resolveCollision(newX: number, newZ: number, building: CollisionBox): { x: number; z: number } {
    const centerX = (building.min.x + building.max.x) / 2;
    const centerZ = (building.min.z + building.max.z) / 2;

    const dx = newX - centerX;
    const dz = newZ - centerZ;

    const halfWidth = (building.max.x - building.min.x) / 2 + this.playerRadius;
    const halfDepth = (building.max.z - building.min.z) / 2 + this.playerRadius;

    const overlapX = halfWidth - Math.abs(dx);
    const overlapZ = halfDepth - Math.abs(dz);

    if (overlapX < overlapZ) {
      return {
        x: dx > 0 ? building.max.x + this.playerRadius : building.min.x - this.playerRadius,
        z: newZ
      };
    } else {
      return {
        x: newX,
        z: dz > 0 ? building.max.z + this.playerRadius : building.min.z - this.playerRadius
      };
    }
  }
}

export const collisionSystem = new CollisionSystem();
