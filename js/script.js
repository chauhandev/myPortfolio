
import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.132.2-dLPTyDAYt6rc6aB18fLm/mode=imports/optimized/three.js';
import { OrbitControls } from 'https://cdn.skypack.dev/pin/three@v0.132.2-dLPTyDAYt6rc6aB18fLm/mode=imports/unoptimized/examples/jsm/controls/OrbitControls.js';

// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#myCanvas'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 50);
// camera.position.setX(-3);

renderer.render(scene, camera);

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);

function storeCoordinate(xVal, yVal,zVal, array) {
  array.push({x: xVal, y: yVal, z:zVal});
}

var coords = [];

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(500));
  
  storeCoordinate(x,y,z,coords)
  star.position.set(x, y, z);
  scene.add(star);
}
Array(5000).fill().forEach(addStar);

// Background
const spaceTexture = new THREE.TextureLoader().load('images/space.jpg');
scene.background = spaceTexture;

// Avatar
const Texture = new THREE.TextureLoader().load('profile.png');
const image = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: Texture }));
// scene.add(image);

// Moon
const moonTexture = new THREE.TextureLoader().load('images/moon.jpg');
const normalTexture = new THREE.TextureLoader().load('normal.jpg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
 // new THREE.MeshStandardMaterial({ color: 0xAA4A44 })
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  })
);

scene.add(moon);

moon.position.z = 20;
moon.position.setX(-10);
image.position.z = -5;
image.position.x = 2;

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  //moon.rotation.x += 0.05;
 // moon.rotation.y += 0.075;
  //moon.rotation.z += 0.05;

  image.rotation.y += 0.01;
  image.rotation.z += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}
const cursorObject = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
  // new THREE.MeshStandardMaterial({
  //   map: moonTexture,
  //   normalMap: normalTexture,
  // })
);
 cursorObject.visible = false;
scene.add(cursorObject)

document.body.onscroll = moveCamera;
moveCamera();

window.addEventListener("mousemove", onmousemove, false);

var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var intersectPoint = new THREE.Vector3();

function onmousemove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(plane, intersectPoint);
  cursorObject.position.copy(intersectPoint);
  cursorObject.position.z = 0;
 // moveStar();
}

function moveStar() {
   
  cursorObject.geometry.computeBoundingBox ();
            var bBox = cursorObject.geometry.boundingBox.clone();
            bBox.applyMatrix4(cursorObject.matrixWorld);
            // compute overall bbox
            let minX = bBox.min.x;
            let minY = bBox.min.y;
            let maxX = bBox.max.x;
            let maxY = bBox.max.y;
            let centePoint = new THREE.Vector2((maxX-minX)/2 , (maxY-minY)/2)

  scene.traverse(function (node) {

    if (node instanceof THREE.Mesh && node.visible) {
      node.geometry.computeBoundingBox ();
      var nodebBox = node.geometry.boundingBox.clone();
      nodebBox.applyMatrix4(node.matrixWorld);
      // compute overall bbox
      let nodeminX = nodebBox.min.x;
      let nodeminY = nodebBox.min.y;
      let nodemaxX = nodebBox.max.x;
      let nodemaxY = nodebBox.max.y;
      let nodecentePoint = new THREE.Vector2((maxX-minX)/2 , (maxY-minY)/2)

      if(isRectangleOverlap(minX ,minY ,maxX ,maxY ,nodeminX,nodeminY,nodemaxX,nodemaxY)){

        var dir = new THREE.Vector3();
        dir.subVectors( centePoint, nodecentePoint ).normalize();
        // node.position.add(dir.addScaler(5))
        node.position.x +=0.05;
      }

    }

  });

}

function isRectangleOverlap( minAx,  minAy,  maxAx,  maxAy,   minBx,  minBy,  maxBx,  maxBy  ) {
  let aLeftOfB = maxAx < minBx;
  let aRightOfB = minAx > maxBx;
  let aAboveB = minAy > maxBy;
  let aBelowB = maxAy < minBy;

  return !( aLeftOfB || aRightOfB || aAboveB || aBelowB );
}

// Animation Loop

window.addEventListener('resize', onWindowResize);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  moon.rotation.x += 0.008;
  controls.update();
  renderer.render(scene, camera);
}

animate();

const canvas = document.getElementById("profileCanvas");
const context = canvas.getContext('2d');

const img = new Image();
img.src = '/images/moon.jpg';
img.onload = function (e)
{
    context.drawImage(img, 0, 0);
}