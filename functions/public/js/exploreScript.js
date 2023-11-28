(() =>{
var camera, scene, renderer, mesh_local, mesh_remote, mesh_icon, group, control, loader_font;
var controlsManager, altControls, customRotationHandleX, customRotationHandleY, customRotationHandleZ, translationHandleZ;
var remote_y = 0.25;
const mixers = [];
const clock = new THREE.Clock();
var raycaster, mouse = { x: 0, y: 0 };
var drawArrow = false;
var arrowCounter = 0;
var notesCounter = 0;
// var chatCounter = 0;
var user_id = null;
// for asset packer
var files = [];
var fileblobs = [];
var gltf;
var remainingfilestoprocess = 0;
var glbfilename;
var outputBuffers;
var bufferMap;
var bufferOffset;
var defaultMeshPositions = {};
var modelMeshes = {};
var uid_firebase;
var storageRef;
var database;
var photoURL;

var baseUrl = "https://firebasestorage.googleapis.com/v0/b/ajnabuild-cb49d.appspot.com/o/models%2F";
var token = "?alt=media&token=c40c0d68-6293-410b-aa40-daee0b3a08e6";

init();
firebaseConfigure();
animate();

// Event Listener for Conference Config Buttons
// document.getElementById('connect_button').addEventListener('click', connect);
// document.getElementById('logout').addEventListener('click', disconnect);


// Event Listeners for Model Transformations

$('#disperseBtn').on('click', function () {                                                                             // Disperse Model
    // database.ref('rooms/' + room + '/' + control.object.name).once('value', snapshot => {
    //     if (snapshot.val().dispersed == "false") {
    //         database.ref('rooms/' + room + '/' + control.object.name).update({ dispersed: "true" });
            
    //         for(let i=0; i<modelMeshes[control.object.name]['mesh_list'].length; i++){
    //             var meshDataObj = {};
    //             meshDataObj.modelName = modelMeshes[control.object.name]['mesh_list'][i];
    //             var meshObj = scene.getObjectByName(meshDataObj.modelName);
    //             meshDataObj.px = (meshObj.position.x).toFixed(6);
    //             meshDataObj.py = (meshObj.position.y).toFixed(6);
    //             meshDataObj.pz = (meshObj.position.z).toFixed(6);
    //             meshDataObj.sx = (meshObj.scale.x).toFixed(6);
    //             meshDataObj.sy = (meshObj.scale.y).toFixed(6);
    //             meshDataObj.sz = (meshObj.scale.z).toFixed(6);
    //             meshDataObj.qx = (meshObj.quaternion.x).toFixed(6);
    //             meshDataObj.qy = (meshObj.quaternion.y).toFixed(6);
    //             meshDataObj.qz = (meshObj.quaternion.z).toFixed(6);
    //             meshDataObj.qw = (meshObj.quaternion.w).toFixed(6);
    //             meshDataObj.fileType = 'ModelMesh';
    //             meshDataObj.parentModelName = control.object.name; 

    //             database.ref('rooms/' + room + '/' + meshDataObj.modelName).update(meshDataObj);
    //         }
    //     } 
    // });
    disperseMeshes(control.object);
});


$('#r').click(function () {                                                                                             // Rotate Model
    control.setMode("rotate");
    $('#r').attr("src", "/images/RotationW.png");
    $('#r').css("background-color", "black");
    $('#t').attr("src", "/images/Position.png");
    $('#t').css("background-color", "white");
    $('#s').attr("src", "/images/Scale.png");
    $('#s').css("background-color", "white");
    $("#tempDiv").css({ display: 'none' });
});

$('#restoreBtn').on('click', function () {                                                                              // Restore Model
    modelMeshes[control.object.name]['isDispersed'] = false;
    restoreMeshes(control.object.name);
});

$('#s').click(function () {                                                                                             // Scale Model
    control.setMode("scale");
    $('#r').attr("src", "/images/Rotation.png");
    $('#r').css("background-color", "white");
    $('#t').attr("src", "/images/Position.png");
    $('#t').css("background-color", "white");
    $('#s').attr("src", "/images/ScaleW.png");
    $('#s').css("background-color", "black");
    $("#tempDiv").css({ display: 'none' });
});
 
$('#t').click(function () {                                                                                             // Translate Model
    control.setMode("translate");
    $('#r').attr("src", "/images/Rotation.png");
    $('#r').css("background-color", "white");
    $('#t').attr("src", "/images/PositionW.png");
    $('#t').css("background-color", "black");
    $('#s').attr("src", "/images/Scale.png");
    $('#s').css("background-color", "white");
    $("#tempDiv").css({ display: 'none' });
});

class CustomRotation extends FreeformControls.RotationGroup {                                                           // class for custom controller handles
    constructor(color) {
        super();
        this.ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.7, 0.1, 16, 100),
            new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
        );
        this.add(this.ring);
    }

    getInteractiveObjects = () => {
        return [this.ring];
    };

    setColor = (color) => {
        this.ring.material.color.set(color);
    };
}

function addModelName(mesh_obj) {
    loader_font.load('/font.json', function (font) {
        var geom_annot = new THREE.TextGeometry(mesh_obj.name, {
            font: font,
            size: 0.110,
            height: 0,
            curveSegments: 12,
            bevelEnabled: false,
        });

        var material_annot = new THREE.MeshBasicMaterial({ color: 0x000000 });
        var mesh_annot = new THREE.Mesh(geom_annot, material_annot);
        mesh_annot.name = "annot_" + mesh_obj.name;
        mesh_annot.position.set(mesh_obj.position.x, mesh_obj.position.y + 0.02, mesh_obj.position.z);
        // mesh_annot.quaternion.copy(camera.quaternion);
        mesh_obj.add(mesh_annot);
        console.log(">>>>>>>", mesh_obj.name);
    });
}

function animate() {
    renderer.render(scene, camera);
    update();
    requestAnimationFrame(animate);
}

function changeBG() {
    scene.background = new THREE.TextureLoader().load(this.src);
    $('#bg_img_modal').modal('hide');
}

function deleteArrows(parentModel, i) {                                                                                 // Delete arrows
    var parentObject = scene.getObjectByName(parentModel);
    parentObject.remove(parentObject.getObjectByName("arrow" + i + parentModel));
    parentObject.remove(parentObject.getObjectByName("annotarrow" + i + parentModel));
    arrowCounter -= 1;
}

function deleteModels(modelName) {                                                                                      // Delete model
    if (control.object && control.object.name == modelName) {
        control.detach();
        $("#tempDiv").css({ display: 'none' });
        // controlsManager.detach(altControls.object,altControls);

    }
    var deleteM = scene.getObjectByName(modelName);
    var deleteE = document.getElementById(modelName);
    scene.remove(deleteM);
    if (deleteE) {
        deleteE.remove();
    }

}

function disperseMeshes(model) {
    
    var model_name = model.name;
    modelMeshes[model_name]['isDispersed'] = true;   // set flag to True for raycast check
    
    var box = new THREE.Box3().setFromObject( model );
    console.log( box.min, box.max, box.getSize() );
    var model_meshes = modelMeshes[model_name]['mesh_list'];
    var numOfMeshes = model_meshes.length;
    for(let i=0; i<numOfMeshes/2; i++) {
        var meshObj = scene.getObjectByName(model_meshes[i]);
        
        meshObj.position.x = meshObj.position.x - (i);
        meshObj.position.y = meshObj.position.y - (i);
        meshObj.position.z = meshObj.position.z - (i);
        console.log("<<<<<<<", meshObj.name);
        addModelName(meshObj);

    }

    for(let i=Math.ceil(numOfMeshes/2); i<numOfMeshes; i++) {
        var meshObj = scene.getObjectByName(model_meshes[i]);
        
        meshObj.position.x = meshObj.position.x + ((i - numOfMeshes/2));
        meshObj.position.y = meshObj.position.y + ((i - numOfMeshes/2));
        meshObj.position.z = meshObj.position.z + ((i - numOfMeshes/2));
        console.log("<<<<<<<", meshObj.name)
        addModelName(meshObj);

    }
}

function firebaseConfigure() {
    firebase.initializeApp(firebaseConfig);
    storageRef = firebase.storage().ref();
    database = firebase.database();
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            uid_firebase = user.uid;
            var providerData = user.providerData;
            // $('#connect_button').prop('disabled', false);

            loadModelFromLocalStorage();

        }
        else {
            console.log("user not logged in");
            // $('#connect_button').hide();
            // window.alert("session expired!!! Please Logout and Re-login");
            window.location.assign("/logout");
        }
    });

    // end of firebase configure....
}

function getCameraDimAtDistance() {
    var vFOV = THREE.MathUtils.degToRad(camera.fov); // convert vertical fov to radians
    var frustumHeight = 2 * Math.tan(vFOV / 2) * 0.3; // visible height //dist is considered as 100
    var frustumWidth = frustumHeight * camera.aspect;
    return [frustumWidth, frustumHeight];
}

function getModelMeshes(modelCopy, model_name) {
    // console.log(modelCopy.name, "is not a mesh. Going one level deeper");
    if (modelCopy.type == 'Mesh') {

        if (!(model_name in modelMeshes)){
            modelMeshes[model_name] = { 'mesh_list': [modelCopy.name] };
        } else {
            modelMeshes[model_name]['mesh_list'].push(modelCopy.name);
        }

        if (!(model_name in defaultMeshPositions)){
            defaultMeshPositions[model_name] = {};
        }

        if (!(modelCopy.name in defaultMeshPositions[model_name])) {
            defaultMeshPositions[model_name][modelCopy.name] = {
                px: modelCopy.position.x,
                py: modelCopy.position.y,
                pz: modelCopy.position.z,
                sx: modelCopy.scale.x,
                sy: modelCopy.scale.y,
                sz: modelCopy.scale.z,
                rx: modelCopy.rotation.x,
                ry: modelCopy.rotation.y,
                rz: modelCopy.rotation.z,
            }
        }
        return;
    }
    while (modelCopy.type != 'Mesh') {
        // console.log("It has",modelCopy.children.length, " children");
        for (var i = 0; i < modelCopy.children.length; i++) {
            // console.log(i, modelCopy.name)
            var newModel = modelCopy.children[i];
            getModelMeshes(newModel, model_name);
        }
        return;
    }

}

function init() {

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    scene = new THREE.Scene();

    var textureCube = new THREE.TextureLoader().load("/images/BGWooden.png");
    scene.background = textureCube;

    loader_font = new THREE.FontLoader();

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 30, 10);
    scene.add(light);

    var light_down = new THREE.DirectionalLight(0xffffff, 1);
    light_down.position.set(0, -30, 10);
    scene.add(light_down);

    var flagLight = new THREE.DirectionalLight(0xffffff, 1);
    flagLight.position.set(0, 0, 500);
    scene.add(flagLight);

    var Light2 = new THREE.DirectionalLight(0xffffff, 1);
    Light2.position.set(-500, 0, 0);
    scene.add(Light2);

    group = new THREE.Group();
    scene.add(group);

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.addEventListener('click', raycast, false);

    document.body.appendChild(renderer.domElement);

    // up.addEventListener('click',moveUp);
    // down.addEventListener('click',moveDown);
    window.addEventListener('resize', onWindowResize, false);

    control = new THREE.TransformControls(camera, renderer.domElement);
    control.addEventListener('change', function () {
        var mode = control.getMode();
        var object = {};
        if (control.object) {
            if (control.object.userData.type !== "screen") {
                object.name = control.object.name;
                if (mode == "translate") {
                    object.px = (control.object.position.x).toFixed(6);
                    object.py = (control.object.position.y).toFixed(6);
                    object.pz = (control.object.position.z).toFixed(6);
                    object.sx = (control.object.scale.x).toFixed(6);
                    object.sy = (control.object.scale.y).toFixed(6);
                    object.sz = (control.object.scale.z).toFixed(6);
                    var firebaseRTD = {
                        px: object.px,
                        py: object.py,
                        pz: object.pz,
                        sx: object.sx,
                        sy: object.sy,
                        sz: object.sz
                    };
                    // database.ref('rooms/' + room + '/' + object.name).update(firebaseRTD);
                }

                if (mode == "rotate") {
                    object.qx = (control.object.quaternion.x).toFixed(6);
                    object.qy = (control.object.quaternion.y).toFixed(6);
                    object.qz = (control.object.quaternion.z).toFixed(6);
                    object.qw = (control.object.quaternion.w).toFixed(6);

                    var firebaseRTD = {
                        qx: object.qx,
                        qy: object.qy,
                        qz: object.qz,
                        qw: object.qw
                    };
                    // database.ref('rooms/' + room + '/' + object.name).update(firebaseRTD);
                }

                if (mode == "scale") {
                    object.px = (control.object.position.x).toFixed(6);
                    object.py = (control.object.position.y).toFixed(6);
                    object.pz = (control.object.position.z).toFixed(6);
                    object.sx = (control.object.scale.x).toFixed(6);
                    object.sy = (control.object.scale.y).toFixed(6);
                    object.sz = (control.object.scale.z).toFixed(6);
                    var firebaseRTD = {
                        px: object.px,
                        py: object.py,
                        pz: object.pz,
                        sx: object.sx,
                        sy: object.sy,
                        sz: object.sz
                    };
                    // database.ref('rooms/' + room + '/' + object.name).update(firebaseRTD);
                }
            }
        }
    });
    scene.add(control);
    control.setSize(0.8);

    controlsManager = new FreeformControls.ControlsManager(camera, renderer.domElement);
    scene.add(controlsManager);

    controlsManager.listen(FreeformControls.EVENTS.DRAG_START, (object, handleName) => {
        // control.detach();
    });

    controlsManager.listen(FreeformControls.EVENTS.DRAG, (objectAttached, handleName) => {
        var object = {};
        object.qx = (objectAttached.quaternion.x).toFixed(6);
        object.qy = (objectAttached.quaternion.y).toFixed(6);
        object.qz = (objectAttached.quaternion.z).toFixed(6);
        object.qw = (objectAttached.quaternion.w).toFixed(6);
        object.px = (objectAttached.position.x).toFixed(6);
        object.py = (objectAttached.position.y).toFixed(6);
        object.pz = (objectAttached.position.z).toFixed(6);
        object.sx = (objectAttached.scale.x).toFixed(6);
        object.sy = (objectAttached.scale.y).toFixed(6);
        object.sz = (objectAttached.scale.z).toFixed(6);

        var firebaseRTD = {
            qx: object.qx,
            qy: object.qy,
            qz: object.qz,
            qw: object.qw,
            px: object.px,
            py: object.py,
            pz: object.pz,
            sx: object.sx,
            sy: object.sy,
            sz: object.sz
        };
        // database.ref('rooms/' + room + '/' + objectAttached.name).update(firebaseRTD);

    });

    controlsManager.listen(FreeformControls.EVENTS.DRAG_STOP, (object, handleName) => {
        // control.attach(object);
    });



    //function to enable tool-tips
    // $(function () {
    // 	$('[data-toggle="tooltip"]').tooltip()
    // });
}

function isDispersedMesh(meshObj) {
    var tempObj = meshObj;
    while ((tempObj["type"] != "Scene") && (tempObj["type"] != "Group")) {
        tempObj = tempObj.parent;
    }
    console.log(tempObj);
    // console.log(modelMeshes[tempObj.parent.name]['mesh_list'].includes(meshObj.name), modelMeshes[tempObj.parent.name]['isDispersed'] == 'true', tempObj.type == "Group");
    if ((tempObj.type == "Group") && 
        (modelMeshes[tempObj.parent.name]['mesh_list'].includes(meshObj.name)) &&
        (modelMeshes[tempObj.parent.name]['isDispersed'])) {
        return true;
    }

    return false;
}

/*  funtion to load FBX models
    @param url ----firebase remote url of object
    @param px,py,pz ----translate positions
    @param qx,qy,qz,qw -----quaternion rotations
    @param sx,sy,sz ------scale values
    @param modelName - name with which model is referenced in the scene     */
function loadFBX(url, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName) {
    var path = url;
    const loader = new FBXLoader();
    const onLoad = (fbx, position) => {
        const model = fbx;
        model.traverse(function (node) {
            if (node.isMesh || node.isLight) node.castShadow = true;
            if (node.isMesh || node.isLight) node.receiveShadow = true;
        });
        model.scale.set(sx, sy, sz);
        model.name = modelName;
        model.position.copy(position);
        model.quaternion.x = qx;
        model.quaternion.y = qy;
        model.quaternion.z = qz;
        model.quaternion.w = qw;
        const animation = fbx.animations[0];
        const mixer = new THREE.AnimationMixer(model);
        mixers.push(mixer);
        if (animation) {
            const action = mixer.clipAction(animation);
            action.play();
        }

        scene.add(model);
    };
    // the loader will report the loading progress to this function
    const onProgress = (xhr) => {
        $("#model_load_bar_container").show();
        var current = parseInt(xhr.loaded / xhr.total * 100);
        current += "%";
        $("#model_load_bar").css("width", current);
        $('#model_load_bar_percent').text(current);
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        if (xhr.loaded == xhr.total) {
            $("#model_load_bar").css("width", "0%");
            $("#model_load_bar_container").hide();
        }
    };
    // the loader will send any error messages to this function, and we'll log them to to console
    const onError = (errorMessage) => { console.log(errorMessage); };
    // load the first model. Each model is loaded asynchronously,
    const position = new THREE.Vector3(px, py, pz);
    loader.load(path, fbx => onLoad(fbx, position), onProgress, onError);
}

/*  funtion to load models------.gltf or .glb models
    @param url ----firebase remote url of object
    @param px,py,pz ----translate positions
    @param qx,qy,qz,qw -----quaternion rotations
    @param sx,sy,sz ------scale values
    @param modelName - name with which model is referenced in the scene     */
function loadModelFromLocalStorage() {

    var path = localStorage.getItem("exploreModel_url");
    // var path = "https://firebasestorage.googleapis.com/v0/b/ajnasuite.appspot.com/o/qTubeZIRTRTY1oS67pwqNhv3cCJ2%2FMarsRover.glb?alt=media&token=17dad4b9-7903-4e8e-87ac-5c1dba35c5ea"
    // var path = "https://firebasestorage.googleapis.com/v0/b/ajnasuite.appspot.com/o/H1FA6FSczoYFLFtv9O1WLP3pguz2%2FEngine.glb?alt=media&token=131b485f-0bfa-4484-b279-b51e99bd689a"
    const loader = new THREE.GLTFLoader();
    const onLoad = (gltf, position) => {
        const model = gltf.scene;
        console.log(model);
        var modelName = localStorage.getItem("exploreModel_name");

        getModelMeshes( model, modelName );
        modelMeshes[modelName]['isDispersed'] = false;

        model.traverse(function (node) {

            if (node.isMesh || node.isLight) node.castShadow = true;
            if (node.isMesh || node.isLight) node.receiveShadow = true;

        });
        model.quaternion.x = 0;
        model.quaternion.y = 0;
        model.quaternion.z = 0;
        model.quaternion.w = 0;
        const animation = gltf.animations[0];
        const mixer = new THREE.AnimationMixer(model);
        mixers.push(mixer);
        if (animation) {
            const action = mixer.clipAction(animation);
            action.play();
        }

        var currentBound = new THREE.Box3();
        currentBound.setFromObject(model);
        var currentBoundSize = new THREE.Vector3();
        currentBound.getSize(currentBoundSize);
        var cameraDims = getCameraDimAtDistance();
        if (currentBoundSize.x > currentBoundSize.y) {
            var newScale = (cameraDims[0] / currentBoundSize.x) * 0.5;
        }
        else {
            var newScale = (cameraDims[1] / currentBoundSize.y) * 0.5;
        }
        if (newScale > 1) {
            newScale = 1;
        }
        model.scale.set(newScale, newScale, newScale);

        const group = new THREE.Object3D();
        var customData = { "type": "3DModel" };
        group.userData = customData;
        group.name = modelName;
        group.add(model);
        group.scale.set(1, 1, 1);
        group.position.set(0, 0, -0.3);

        scene.add(group);
    };
    // the loader will report the loading progress to this function
    const onProgress = (xhr) => {
        $("#model_load_bar_container").show();
        var current = parseInt(xhr.loaded / xhr.total * 100);
        current += "%";
        $("#model_load_bar").css("width", current);
        $('#model_load_bar_percent').text(current);

        if (xhr.loaded == xhr.total) {
            $("#model_load_bar").css("width", "0%");
            $("#model_load_bar_container").hide();
        }
    };
    // the loader will send any error messages to this function, and we'll log them to to console
    const onError = (errorMessage) => { console.log(errorMessage); };
    // load the first model. Each model is loaded asynchronously,
    const position = new THREE.Vector3(0, 0, 0);
    loader.load(path, gltf => onLoad(gltf, position), onProgress, onError);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function raycast(e) {
    console.log("inside raycast");
    // if(Object.keys(controlsManager.controls).length > 0){
    //       controlsManager.detach(altControls.object,altControls);
    //       control.detach();
    //     }


    //1. sets the mouse position with a coordinate system where the center of the screen is the origin
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

    //2. set the picking ray from the camera position and mouse coordinates
    raycaster.setFromCamera(mouse, camera);

    //3. compute intersections
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (drawArrow == false) {
        if (Object.keys(controlsManager.controls).length > 0) {
            controlsManager.detach(altControls.object, altControls);
            control.detach();
        }
        for (var i = 0; i < intersects.length; i++) {

            if (intersects[i].object.type == "Mesh") {

                var internalObject = intersects[i].object;

                if (isDispersedMesh(internalObject)) {
                    console.log("Mesh name:", internalObject);
                    // attach controls and stuff
                    $("#tempDiv").hide();
                    $('#tempDiv img').show();
                    $("#next").hide();
                    $("#disperseBtn").hide();
                    $("#restoreBtn").hide();
                    $("#previous").hide();
                    $("#play").hide();
                    $("#selectParentBtn").show();
                    $("#tempDiv").css({
                        position: 'absolute',
                        left: e.pageX + 50,
                        top: e.pageY + 50,
                        display: 'block'
                    });

                    // Select Parent Model
                    $('#selectParentBtn').on('click', function () {
                        
                        $("#tempDiv").hide();
                        $('#tempDiv img').show();
                        $("#next").hide();
                        $("#disperseBtn").show();
                        $("#restoreBtn").show();
                        $("#previous").hide();
                        $("#play").hide();
                        $("#selectParentBtn").hide();
                        $("#tempDiv").css({
                            position: 'absolute',
                            left: e.pageX + 50,
                            top: e.pageY + 50,
                            display: 'block'
                        });

                        var selectedModel = scene.getObjectByName(Object.keys(modelMeshes)[0]);
                        control.detach();
                        control.attach(selectedModel);
                    });

                    var selectedModel = scene.getObjectByName(internalObject.name);
                    control.detach();
                    control.attach(selectedModel);
                    break;
                } else {

                    while ((internalObject["type"] != "Scene") && (internalObject["type"] != "Group")) {
                        internalObject = internalObject.parent;
                    }

                    if (internalObject.type == "Group") {
                        $("#tempDiv").hide();
                        $('#tempDiv img').show();
                        $("#next").hide();
                        $("#disperseBtn").show();
                        $("#restoreBtn").show();
                        $("#previous").hide();
                        $("#play").hide();
                        $("#selectParentBtn").hide();
                        $("#tempDiv").css({
                            position: 'absolute',
                            left: e.pageX + 50,
                            top: e.pageY + 50,
                            display: 'block'
                        });
                        var selectedModel = scene.getObjectByName(internalObject.parent.name);
                        control.detach();
                        control.attach(selectedModel);

                        break;
                    }
                }
            }
            if (i == intersects.length - 1) {
                // $(".toggleOut").fadeOut();
                $("#tempDiv").css({ display: 'none' });
                if (control.object) {
                    control.detach();
                }
            }

        }
    }
    else {
        var intersectedModel = raycaster.intersectObject(control.object, true);
        if (intersectedModel.length > 0) {
            $("#submitAnnotation").off("click");
            var intersectedWorld = new THREE.Vector3(intersectedModel[0].point.x, intersectedModel[0].point.y, intersectedModel[0].point.z);
            var intersectedLocal = control.object.worldToLocal(intersectedWorld);
            $('#openAnnotationModal').modal('show');

            $("#submitAnnotation").click(function () {
                sendRoomArrow(control.object.name, intersectedLocal.x, intersectedLocal.y, intersectedLocal.z, $('#enterAnnotation').val());
                $('#openAnnotationModal').modal('hide');
                drawArrow = false;
                $('#annotations').attr("src", "/images/annotations.png");
                $('#annotations').css("background-color", "");
                $("#tempDiv").css({ display: 'none' });
            });
        }
    }

}

function receiveTransformModel(px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName) {                                     // Transform model by remote client
    console.log("updating position");
    var model = scene.getObjectByName(modelName);
    // quaternion to euler conversions
    var quaternion = new THREE.Quaternion();
    quaternion.set(qx, qy, qz, qw);
    var euler = new THREE.Euler();
    euler.setFromQuaternion(quaternion);
    // positions
    model.position.x = px;
    model.position.y = py;
    model.position.z = pz;
    // rotations
    model.rotation.x = euler.x;
    model.rotation.y = euler.y;
    model.rotation.z = euler.z;
    // scales
    model.scale.x = sx;
    model.scale.y = sy;
    model.scale.z = sz;

}

function removeRoomArrows(parentModel) {

    database.ref('rooms/' + room + '/' + parentModel).once('value', snapshot => {
        var parentCount = parseInt(snapshot.val().arrowCount);
        var removeObject = {};
        for (var i = 0; i < parentCount; i++) {
            removeObject["arrow" + i] = null;
        }
        removeObject["arrowCount"] = "0";
        removeObject["nextArrowCount"] = (arrowCounter - parentCount).toString();
        database.ref('/rooms/' + room + '/' + parentModel).update(removeObject);
    });
}

function restoreMeshes(model_name) {
    for (const objName in defaultMeshPositions[model_name]) {
        var objectToPosition        = scene.getObjectByName(objName);
        objectToPosition.children = [];
        objectToPosition.position.x = defaultMeshPositions[model_name][objName].px;
        objectToPosition.position.y = defaultMeshPositions[model_name][objName].py;
        objectToPosition.position.z = defaultMeshPositions[model_name][objName].pz;
        objectToPosition.scale.x    = defaultMeshPositions[model_name][objName].sx;
        objectToPosition.scale.y    = defaultMeshPositions[model_name][objName].sy;
        objectToPosition.scale.z    = defaultMeshPositions[model_name][objName].sz;
        objectToPosition.rotation.x = defaultMeshPositions[model_name][objName].rx;
        objectToPosition.rotation.y = defaultMeshPositions[model_name][objName].ry;
        objectToPosition.rotation.z = defaultMeshPositions[model_name][objName].rz;
    }
}

function sendUID(uid, screen, video) {
    database.ref('currentUsers/' + uid).set({
        screen: screen,
        video: video,
        name: displayName,
        photo: photoURL
    }, function (error) {
        if (error) {                                                                                                
            console.log(error);
        }
        else {
            console.log("user details added on firebase");
        }
    });
}

function sendModel(path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, fileType, room) {
    var today = new Date();
    var modelName = modelName+"_"+today.getFullYear()+today.getMonth()+1+today.getDate()+today.getHours()+today.getMinutes()+today.getSeconds();
    console.log('Host sending model to firebase server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
    if (docSupportedFormats.includes(fileType.toLowerCase())) {
        database.ref('rooms/' + room + '/' + modelName).set({
            url: path1,
            px: px.toFixed(6),
            py: py.toFixed(6),
            pz: pz.toFixed(6),
            qx: qx.toFixed(6),
            qy: qy.toFixed(6),
            qz: qz.toFixed(6),
            qw: qw.toFixed(6),
            sx: sx.toFixed(6),
            sy: sy.toFixed(6),
            sz: sz.toFixed(6),
            currentPage: "0",
            modelName: modelName,
            fileType: fileType
        }, function (error) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Host sent model to firebase Server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
            }
        });
    }
    else if (videoSupportedFormats.includes(fileType.toLowerCase())) {
        database.ref('rooms/' + room + '/' + modelName).set({
            url: path1,
            px: px.toFixed(6),
            py: py.toFixed(6),
            pz: pz.toFixed(6),
            qx: qx.toFixed(6),
            qy: qy.toFixed(6),
            qz: qz.toFixed(6),
            qw: qw.toFixed(6),
            sx: sx.toFixed(6),
            sy: sy.toFixed(6),
            sz: sz.toFixed(6),
            status: "0",
            modelName: modelName,
            fileType: fileType
        }, function (error) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Host sent model to firebase Server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
            }
        });
    }
    else {
        database.ref('rooms/' + room + '/' + modelName).set({
            url: path1,
            px: px.toFixed(6),
            py: py.toFixed(6),
            pz: pz.toFixed(6),
            qx: qx.toFixed(6),
            qy: qy.toFixed(6),
            qz: qz.toFixed(6),
            qw: qw.toFixed(6),
            sx: sx.toFixed(6),
            sy: sy.toFixed(6),
            sz: sz.toFixed(6),
            arrowCount: "0",
            nextArrowCount: arrowCounter.toString(),
            modelName: modelName,
            dispersed: 'false',
            fileType: fileType
        }, function (error) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Host sent model to firebase Server: ', path1, px, py, pz, qx, qy, qz, qw, sx, sy, sz, modelName, room);
            }
        });
    }



}

function sendRoomArrow(parentModel, px, py, pz, annoText) {
    var arrowPos = {
        annot: annoText,
        px: px.toFixed(6),
        py: py.toFixed(6),
        pz: pz.toFixed(6)
    };
    database.ref('rooms/' + room + '/' + parentModel).once('value', snapshot => {
        var arrow_name = "arrow" + snapshot.val().arrowCount;
        // database.ref('/rooms/' + room + '/' +parentModel+ '/'+arrow_name).set(arrowPos);
        var arrowObject = {};
        arrowObject["arrowCount"] = (parseInt(snapshot.val().arrowCount) + 1).toString();
        arrowObject["nextArrowCount"] = (arrowCounter + 1).toString();
        arrowObject[arrow_name] = arrowPos;
        database.ref('/rooms/' + room + '/' + parentModel).update(arrowObject);

    });

}

function update() {
    const delta = clock.getDelta();
    for (const mixer of mixers) {
        mixer.update(delta);
    }
}

})();