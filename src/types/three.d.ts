import '@react-three/fiber';
import { ThreeElements } from '@react-three/fiber';

declare module '@react-three/fiber' {
  interface ThreeElements {
    mesh: ThreeElements['mesh'];
    group: ThreeElements['group'];
    sphereGeometry: ThreeElements['sphereGeometry'];
    boxGeometry: ThreeElements['boxGeometry'];
    torusGeometry: ThreeElements['torusGeometry'];
    octahedronGeometry: ThreeElements['octahedronGeometry'];
    icosahedronGeometry: ThreeElements['icosahedronGeometry'];
    meshStandardMaterial: ThreeElements['meshStandardMaterial'];
    meshBasicMaterial: ThreeElements['meshBasicMaterial'];
    lineSegments: ThreeElements['lineSegments'];
    lineBasicMaterial: ThreeElements['lineBasicMaterial'];
    primitive: ThreeElements['primitive'];
    points: ThreeElements['points'];
    pointsMaterial: ThreeElements['pointsMaterial'];
    bufferGeometry: ThreeElements['bufferGeometry'];
    bufferAttribute: ThreeElements['bufferAttribute'];
    ambientLight: ThreeElements['ambientLight'];
    directionalLight: ThreeElements['directionalLight'];
    pointLight: ThreeElements['pointLight'];
    fog: ThreeElements['fog'];
    wireframeGeometry: ThreeElements['wireframeGeometry'];
  }
}
