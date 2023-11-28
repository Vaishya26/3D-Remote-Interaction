var scene = new THREE.Scene();
scene.background = new THREE.Color(0xfff7f2);

// canvas = document.getElementById("canvas");
// var width = canvas.offsetWidth;
// var height = canvas.offsetHeight;
// console.log(width);
// console.log(height);



var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

window.addEventListener('resize', function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
};

animate();

$(document).on('click', '#propertiesbtn', function() {
    $('#propertiesPanel').toggle();
})

$(document).on('click', '#closeproperties', function() {
    $('#propertiesPanel').hide();
})

$(document).on('click', '#layersbtn', function() {
    $('#propertiesText').show();
    $('#layers').show();
    $('#publishAssetsBtn').show();
    $('#elementToolboxText').hide();
    $('#elementsDiv').hide();
    $('#layersPanel').show();
});

$(document).on('click', '#elementToolboxbtn', function() {
    $('#propertiesText').hide();
    $('#layers').hide();
    $('#publishAssetsBtn').hide();
    $('#elementToolboxText').show();
    $('#elementsDiv').show();
    $('#layersPanel').show();
});

$(document).on('click', '.closelayers', function() {
    $('#layersPanel').hide();
})



function show() {
    // document.getElementById('propertiesPanel').innerHTML="";
    $('#propertiesPanel').html('');
    $('#propertiesPanel').html('<div class="propertiesText" style="font-size: 16px; font-weight: 500; color:black; margin-top:20px; margin-left:22px;">\
    <h6>Properties<button class="btn btn-sm" id="closeproperties"style="margin-left:180px;"><span aria-hidden="true">&times;</span></button></h6>\
  </div>\
  <div id="addProperties">\
    <div class="transformationText" style="font-size: 12px; font-weight: 500; color:rgb(170, 170, 170); margin-top:20px; margin-left:22px; ">\
    <span>Transformation</span>\
  </div>\
  <div class="transformationProperties" id="transformProp" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170); margin-top:20px; margin-left:22px;"><span>Position</span>\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">X </span>\
    <input type="text" class="transformInput" style="width:40px; height:20px; background:white; border:1px solid black;"">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px; ">Y </span>\
    <input type="text" class="transformInput" style="width:40px; height:20px; background:white; border:1px solid black;"">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Z </span>\
    <input type="text" class="transformInput" style="width:40px; height:20px; background:white; border:1px solid black;"">\
    <br><br>\
    <span>Rotation</span>\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">X </span>\
    <input type="text" class="transformInput" style="width:30px; height:20px;background:white; border:1px solid black;"">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Y </span>\
    <input type="text" class="transformInput" style="width:30px; height:20px; background:white; border:1px solid black;"">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Z </span>\
    <input type="text" class="transformInput" style="width:30px; height:20px; background:white; border:1px solid black;"">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">W</span>\
    <input type="text" class="transformInput" style="width:30px; height:20px; background:white; border:1px solid black;"">\
    <br><br>\
    <span>Scale</span>\
    <span style="margin-left:25px;"><i class="fas fa-link"></i></span>\
    <span  class="xSpan" style="margin-left:5px; margin-right: 5px;">X </span>\
    <input type="text" class="transformInput" style="width:40px; height:20px; background:white; border:1px solid black;">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Y </span>\
    <input type="text" class="transformInput" style="width:40px; height:20px; background:white; border:1px solid black;"">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Z </span>\
    <input type="text" class="transformInput" style="width:40px; height:20px; background:white; border:1px solid black;"">\
    <hr style="margin-right: 10px; color:rgb(170, 170, 170);">\
  </div>');
}

function show1() {
    $('#propertiesPanel').html('');
    $('#propertiesPanel').html('<div class="propertiesText" style="font-size: 16px; font-weight: 500; color:black; margin-top:20px; margin-left:22px;">\
    <h6>Properties<button class="btn btn-sm" id="closeproperties"style="margin-left:180px;"><span aria-hidden="true">&times;</span></button></h6>\
  </div>\
  <div id="addProperties">\
    <div class="transformationText" style="font-size: 12px; font-weight: 500; color:rgb(170, 170, 170); margin-top:20px; margin-left:22px; ">\
    <span>Transformation</span>\
  </div>\
  <div class="transformationProperties" id="transformProp" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170); margin-top:20px; margin-left:22px;"><span>Position</span>\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">X </span>\
    <input type="text" class="transformInput" style="width:40px; height:20px; background:white; border:1px solid black;"">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px; ">Y </span>\
    <input type="text" class="transformInput" style="width:40px; height:20px; background:white; border:1px solid black;"">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Z </span>\
    <input type="text" class="transformInput" style="width:40px; height:20px; background:white; border:1px solid black;"">\
    <br><br>\
    <span>Rotation</span>\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">X </span>\
    <input type="text" class="transformInput" style="width:30px; height:20px;background:white; border:1px solid black;"">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Y </span>\
    <input type="text" class="transformInput" style="width:30px; height:20px; background:white; border:1px solid black;"">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Z </span>\
    <input type="text" class="transformInput" style="width:30px; height:20px; background:white; border:1px solid black;"">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">W</span>\
    <input type="text" class="transformInput" style="width:30px; height:20px; background:white; border:1px solid black;"">\
    <br><br>\
    <span>Scale</span>\
    <span style="margin-left:25px;"><i class="fas fa-link"></i></span>\
    <span  class="xSpan" style="margin-left:5px; margin-right: 5px;">X </span>\
    <input type="text" class="transformInput" style="width:40px; height:20px; background:white; border:1px solid black;">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Y </span>\
    <input type="text" class="transformInput" style="width:40px; height:20px; background:white; border:1px solid black;"">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Z </span>\
    <input type="text" class="transformInput" style="width:40px; height:20px; background:white; border:1px solid black;"">\
    <hr style="margin-right: 10px; color:rgb(170, 170, 170);">\
  </div>\
  <div class="audioSelection" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170); margin-top:20px; margin-left:22px;">\
    <span class="audioURLSpan" style="margin-left:3px; margin-right: 5px; font-size:12px; font-weight: 500; color:rgb(170, 170, 170)">Audio URL</span><input type="text" id="audioURLInput" style="margin-left:30px; margin-bottom:20px;">\
    <br>\
    <span class="audioControlSpan" style=" font-size:12px; font-weight: 500; color:rgb(170, 170, 170)margin-left:5px; margin-top:10px;">Controls</span>\
    <input type="checkbox" class="audioControlInput" style="margin-left:48px; margin-bottom:20px;">\
    <br>\
    <span class="audioLoopSpan" style=" font-size:12px; font-weight: 500; color:rgb(170, 170, 170)margin-left:5px; margin-top:10px;">Loop</span>\
    <input type="checkbox" class="audioLoopInput">\
    <br>\
    <span class="audioPlaySpan" style=" font-size:12px; font-weight: 500; color:rgb(170, 170, 170)margin-left:5px; margin-top:10px;">Auto-Play</span>\
    <input type="checkbox" class="audioPlayInput">\
    <br>\
    <span class="volumeSpan" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170) margin-left:5px; margin-top:10px;">Volume</span>\
    <input type="range" min="0" max="100" class="volumeInput">\
    <br>\
    <span class="refDistanceSpan" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170) margin-left:5px; margin-top:10px;">Ref Distance</span>\
    <input type="text" id="refDistanceInput" style="background:white; border:1px solid black;">\
    <br>\
    <span class="maxDistanceSpan" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170) margin-left:5px; margin-top:10px;">Max Distance</span>\
    <input type="text" id="maxDistanceInput" style="background:white; border:1px solid black;">\
    <br>\
    <span class="RolloffSpan" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170) margin-left:5px; margin-top:10px;">Rolloff Factor</span>\
    <input type="text" id="rolloffInput" style="background:white; border:1px solid black;">\
  </div>')
}

function show2() {
    $('#propertiesPanel').html('');
    $('#propertiesPanel').html('<div class="propertiesText" style="font-size: 16px; font-weight: 500; color:black; margin-top:20px; margin-left:22px;">\
    <h6>Properties<button class="btn btn-sm" id="closeproperties" style="margin-left:180px;"><span aria-hidden="true">&times;</span></button></h6>\
  </div>\
  <div id="addProperties">\
    <div class="transformationText" style="font-size: 12px; font-weight: 500; color:rgb(170, 170, 170); margin-top:20px; margin-left:22px; ">\
    <span>Transformation</span>\
  </div>\
  <div class="transformationProperties" id="transformProp" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170); margin-top:20px; margin-left:22px;">\
    <span>Position</span>\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">X </span>\
    <input type="text" class="transformInput" style="width:40px; background:white; border:1px solid black;height:20px;">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Y </span>\
    <input type="text" class="transformInput" style="width:40px; background:white; border:1px solid black;height:20px;">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Z </span>\
    <input type="text" class="transformInput" style="width:40px;background:white; border:1px solid black; height:20px;">\
    <br><br>\
    <span>Rotation</span>\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">X </span>\
    <input type="text" class="transformInput" style="width:30px; background:white; border:1px solid black;height:20px;">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Y </span>\
    <input type="text" class="transformInput" style="width:30px;background:white; border:1px solid black; height:20px;">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Z </span>\
    <input type="text" class="transformInput" style="width:30px;background:white; border:1px solid black; height:20px;">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">W</span>\
    <input type="text" class="transformInput" style="width:30px; background:white; border:1px solid black;height:20px;">\
    <br><br>\
    <span>Scale</span>\
    <span style="margin-left:25px;"><i class="fas fa-link"></i></span>\
    <span  class="xSpan" style="margin-left:5px; margin-right: 5px;">X </span>\
    <input type="text" class="transformInput" style="width:40px; background:white; border:1px solid black;height:20px;">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Y </span>\
    <input type="text" class="transformInput" style="width:40px; background:white; border:1px solid black;height:20px;">\
    <span  class="xSpan" style="margin-left:10px; margin-right: 5px;">Z </span>\
    <input type="text" class="transformInput" style="width:40px; background:white; border:1px solid black;height:20px; ">\
    <hr style="margin-right: 10px; color:rgb(170, 170, 170);">\
  </div>\
  <div class="animation" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170); margin-left:22px;">\
    <span>Animation Style </span>\
    <button type = "button" style="margin-left:10px; width:150px; height:20px; border:1px solid black;" class = "btn btn-default btn-sm" data-toggle = "dropdown"></button>\
  </div>\
  <div class="collidable" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170); margin-top:30px;margin-left:22px;">\
    <span>Collidable </span>\
    <input type="checkbox" class="collidableInput" style="margin-left:50px; background:white; border:1px solid black;">\
  </div>\
  <div class="light" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170); margin-top:30px; margin-left:22px;">\
    <span>Light Selection </span>\
    <button type = "button" style="margin-left:19px; width:150px; height:20px; border:1px solid black;" class = "btn btn-default btn-sm" data-toggle = "dropdown"></button>\
  </div>\
  <div class="material" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170); margin-top:30px; margin-left:22px;">\
    <span>Material and Shader Selection </span>\
    <hr style="margin-right: 10px; color:rgb(170, 170, 170);">\
  </div>\
  <div class="slidecontainer" style="font-size:12px; font-weight: 500; color:rgb(170, 170, 170); margin-top:20px; margin-left:22px;">\
    <span>Opacity </span>\
    <input type="range" min="0" max="100" class="slider1" style="margin-left:70px;">\
  </div>')
}