(() => {
    var scene, camera, renderer, group, groundMesh, control;
    var isMouseDown = false,
        onPointerDownMouseX = 0,
        onPointerDownMouseY = 0,
        lon = 0,
        onPointerDownLon = 0,
        lat = 0,
        onPointerDownLat = 0,
        phi = 0,
        theta = 0;
    var firebase, storageRef, database, uid_firebase, file;
    var sceneElementsData = JSON.parse(localStorage.getItem('sceneData')) || {}; // initialises scene data from localstorage or empty
    var activeElement;
    var raycaster, mouse = { x: 0, y: 0 };
    const mixers = [];
    const clock = new THREE.Clock();
    var clock2, deltaTime, totalTime, keyboard, mover;

    const refGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const refMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const refCube = new THREE.Mesh(refGeometry, refMaterial);

    var i = 0;
    var j = 0;

    firebaseConfigure();
    init();
    animate();

    // Event Listeners

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

    $(document).on('click', '#layerPublishBtn', function() {
        if ($('#layerNameInp').val() == '') {
            alert('Enter layer name!');
            return;
        }

        let layerData = {};
        let sceneELements = scene.children;
        for (let elIndex in sceneELements) {
            let element = sceneELements[elIndex];

            if (element.userData && element.userData.isLayerElement) {
                layerData[element.name] = {
                    px: (element.position.x).toFixed(6),
                    py: (element.position.y).toFixed(6),
                    pz: (element.position.z).toFixed(6),
                    sx: (element.scale.x).toFixed(6),
                    sy: (element.scale.y).toFixed(6),
                    sz: (element.scale.z).toFixed(6),
                    qx: (element.quaternion.x).toFixed(6),
                    qy: (element.quaternion.y).toFixed(6),
                    qz: (element.quaternion.z).toFixed(6),
                    qw: (element.quaternion.w).toFixed(6),
                    name: element.name
                }
                if (element.userData.type == "3DModel") {
                    layerData[element.name].elementType = 'Model';
                    layerData[element.name].fileType = element.userData.format;
                    layerData[element.name].url = element.userData.url;
                } else if (element.userData.type == "image") {
                    layerData[element.name].elementType = 'Image';
                    layerData[element.name].url = element.userData.url;
                    layerData[element.name].fileType = element.userData.format;
                } else if (element.userData.type == "Step") {
                    layerData[element.name].elementType = 'Text';
                    layerData[element.name].heading = element.userData.heading;
                    layerData[element.name].desc = element.userData.desc;
                }
            }
        }

        database.ref('testSceneCreation/Layers/' + $('#layerNameInp').val()).set(layerData)
            .then(() => {
                swal(
                    'Successful!',
                    'Layer saved successfully!',
                    'success'
                ).catch(swal.noop)
            });

    });

    $(document).on('click', '.img-responsive', function() {
        $('.img-responsive').removeClass('img-active');
        $(this).addClass('img-active');
        if ($('.img-active')[0].dataset.imagefor == 'skybox')
            setSkyBox($(this)[0].src);
        else if ($('.img-active')[0].dataset.imagefor == 'groundplane')
            updateGroundPlane($(this)[0].src, 0, -1, 0);
        else if (activeElement == 'Model')
            loadModelIntoScene($(this)[0].dataset.modelurl, $(this)[0].dataset.modelname, $(this)[0].dataset.modeltype)
        else if (activeElement == 'Image')
            loadImageIntoScene($(this)[0].src, $(this)[0].dataset.imagename, $(this)[0].dataset.imageformat) //start fromn here
        else if (activeElement == 'Video')
            loadVideoIntoScene($(this)[0].src, $(this)[0].dataset.videoname, $(this)[0].dataset.videoformat)
        else if (activeElement == 'Guide')
            loadGuideIntoScene($(this)[0].dataset.guidename)
        else if (activeElement == 'Audio')
            loadAudioIntoScene($(this)[0].dataset.audioname, $(this)[0].dataset.audiourl) //start fromn here

        $('#assetLibraryModal').modal('hide');
    });

    $(document).on('click', '.layerEntry', function() {
        console.log($(this).data('layername'));
        let elementName = $(this).data('layername');
        let sceneEl = scene.getObjectByName(elementName);

        if (control.object.name == elementName) {
            if (control.mode == 'translate') control.setMode("rotate");
            else if (control.mode == 'rotate') control.setMode("scale");
            else if (control.mode == 'scale') control.setMode("translate");
        } else {
            control.detach();
            control.attach(sceneEl);
            setDatatoPropertiesTab(sceneEl);
        }

    });

    $('#guideEditorBtn').on('click', () => {
        if ($('#guideNameInp').val() == "") {
            swal(
                'Name empty',
                'Guide name cannot be blank!',
                'warning'
            ).catch(swal.noop);
            return;
        }
        localStorage.setItem('guideName', $('#guideNameInp').val());
        $('#guideNameInp').val("");
        window.location.href = '/guide';
    })

    $('#skyboxElementBtn').on('click', function() {
        activeElement = 'skybox';
        addImagesToModal(activeElement);
        // setDatatoPropertiesTab(activeElement);
        $('#propertiesPanel').show();
    });

    $('#groundElementBtn').on('click', function() {
        activeElement = 'groundplane';
        addImagesToModal(activeElement);
        // showProperties(activeElement);
        // setDatatoPropertiesTab(activeElement);
        $('#propertiesPanel').show();
    });

    $('#modelElementBtn').on('click', function() {
        activeElement = 'Model';
        addImagesToModal(activeElement);
        // setDatatoPropertiesTab(activeElement);
        $('#propertiesPanel').show();
    });

    $('#imageElementBtn').on('click', function() {
        activeElement = 'Image';
        addImagesToModal(activeElement);
        // setDatatoPropertiesTab(activeElement);
        $('#propertiesPanel').show();
    });

    $('#videoElementBtn').on('click', function() {
        activeElement = 'Video';
        addImagesToModal(activeElement);
        // setDatatoPropertiesTab(activeElement);
        $('#propertiesPanel').show();
    });

    $('#guideElementBtn').on('click', function() {
        activeElement = 'Guide';
        addImagesToModal(activeElement);
        // setDatatoPropertiesTab(activeElement);
        $('#propertiesPanel').show();
    });

    $('#audioElementBtn').on('click', function() {
        activeElement = 'Audio';
        addImagesToModal(activeElement);
        // setDatatoPropertiesTab(activeElement);
        $('#propertiesPanel').show();
    });

    $('.transformInput').on('change', () => {
        console.log("Changingggg");
        control.object.position.x = parseFloat($('#prop-pos-x').val());
        control.object.position.y = parseFloat($('#prop-pos-y').val());
        control.object.position.z = parseFloat($('#prop-pos-z').val());
        control.object.scale.x = parseFloat($('#prop-scale-x').val());
        control.object.scale.y = parseFloat($('#prop-scale-y').val());
        control.object.scale.z = parseFloat($('#prop-scale-z').val());
        control.object.quaternion.x = parseFloat($('#prop-rot-x').val());
        control.object.quaternion.y = parseFloat($('#prop-rot-y').val());
        control.object.quaternion.z = parseFloat($('#prop-rot-z').val());
        control.object.quaternion.w = parseFloat($('#prop-rot-w').val());

    })

    $('#lightElementBtn').on('click', function() {
        activeElement = 'Light';
        addLight();
    })

    $('#confirmCreateTextBtn').on('click', function() {
        if ($('#textElHead').val() == "" && $('#textElDesc').val() == "") {
            swal(
                'Data empty',
                'Fill the Heading and Description input to create the text element!',
                'warning'
            ).catch(swal.noop);
            return;
        }
        activeElement = 'textElement';
        showProperties('textElement');
        addStep($('#textElHead').val(), $('#textElDesc').val());
        $('#textElementInpModal').modal('hide');
    })

    function firebaseConfigure() {
        firebase.initializeApp(firebaseConfig);
        storageRef = firebase.storage().ref();
        database = firebase.database();
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in.
                displayName = user.displayName;
                var email = user.email;
                var emailVerified = user.emailVerified;
                photoURL = user.photoURL;
                var isAnonymous = user.isAnonymous;
                uid_firebase = user.uid;
                var providerData = user.providerData;
            } else {
                // console.log("user not logged in");
                window.location.assign("/logout");
            }
        });
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function updateGroundPlane(photoURL, px, py, pz) {
        const texture = new THREE.TextureLoader().load(photoURL);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(500, 500);

        if (typeof groundMesh == "undefined") { // mesh not initialised yet 

            const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
            const geometry = new THREE.PlaneGeometry(5000, 5000);
            groundMesh = new THREE.Mesh(geometry, material);
            groundMesh.name = "GroundPlane";

            scene.add(groundMesh);
        }

        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.set(px, py, pz);
        groundMesh.scale.set(0.1, 0.1, 0.1);
        groundMesh.material.map = texture;
        groundMesh.material.needsUpdate = true;

        sceneElementsData['Ground'] = {
            elementType: 'Ground',
            px: px,
            py: py,
            pz: pz,
            texture: photoURL
        };

        if ($('#layers').has('div[data-layerType="ground"]').length == 0) {
            $("#layers").append('<div class="layerEntry" data-layerName="GroundPlane" data-layerType="ground"><i class="fas fa-sm fa-seedling"></i>Ground</div>');
        }
    }

    function setSkyBox(imageURL) {
        const loaderSky = new THREE.TextureLoader();
        const textureSky = loaderSky.load(
            imageURL,
            () => {
                const rt = new THREE.WebGLCubeRenderTarget(textureSky.image.height);
                rt.fromEquirectangularTexture(renderer, textureSky);
                scene.background = rt.texture;
            }
        );

        sceneElementsData['SkyBox'] = { texture: imageURL, elementType: "Skybox" };
        if ($('#layers').has('div[data-layerType="skybox"]').length == 0) {
            $("#layers").append('<div class="layerEntry" data-layerName="skybox" data-layerType="skybox"><i class="fas fa-sm fa-cloud-moon" ></i>Skybox</div>');
        }
    }

    function init() {

        let canvasElement = document.getElementById('canvasDiv');

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xfff7f2);
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 200000);
        // camera.position.set(0, 5, 1);
        // mover = new THREE.Group();
        // mover.add( camera );
        // mover.position.set(0, 5, 1);
        // scene.add( mover );
        renderer = new THREE.WebGLRenderer({ antialias: true });

        // scene.background = new THREE.Color( 0xf2f7ff );
        scene.fog = new THREE.Fog(0xf2f7ff, 1, 25000);
        scene.add(new THREE.AmbientLight(0xeef0ff));

        // const light1 = new THREE.DirectionalLight(0xffffff, 2);
        // light1.position.set(5, 5, 5);
        // scene.add(light1);
        // setSkyBox('/images/sky4.jpg');

        // scene = new THREE.Scene();

        // var textureCube = new THREE.TextureLoader().load("/BGWooden.png");
        // scene.background = textureCube;
        let defaultSceneElements = Object.keys(sceneElementsData);
        if (defaultSceneElements.length) {
            $('#projName').html(sceneElementsData.name);
            $('#sceneNameInp').val(sceneElementsData.name);

            if (defaultSceneElements.includes('Ground'))
                updateGroundPlane(sceneElementsData.Ground.texture, sceneElementsData.Ground.px, sceneElementsData.Ground.py, sceneElementsData.Ground.pz);

            if (defaultSceneElements.includes('SkyBox'))
                setSkyBox(sceneElementsData.SkyBox.texture);

        } else {
            // updateGroundPlane('/images/ground.jpg', 0, -1, 0);
            // setSkyBox('/images/sky4.jpg');
        }

        loader_font = new THREE.FontLoader();

        group = new THREE.Group();
        scene.add(group);

        raycaster = new THREE.Raycaster();

        // renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        renderer.domElement.addEventListener('click', raycast, false);
        window.addEventListener('resize', onWindowResize, false);

        clock2 = new THREE.Clock();
        deltaTime = 0;
        totalTime = 0;

        keyboard = new Keyboard();

        control = new THREE.TransformControls(camera, renderer.domElement);
        control.addEventListener('change', function() {
            var mode = control.getMode();
            var object = {};
            if (control.object) {
                if (control.object.userData.type !== "screen") {
                    object.name = control.object.name;
                    object.px = (control.object.position.x).toFixed(6);
                    object.py = (control.object.position.y).toFixed(6);
                    object.pz = (control.object.position.z).toFixed(6);
                    object.sx = (control.object.scale.x).toFixed(6);
                    object.sy = (control.object.scale.y).toFixed(6);
                    object.sz = (control.object.scale.z).toFixed(6);
                    object.qx = (control.object.quaternion.x).toFixed(6);
                    object.qy = (control.object.quaternion.y).toFixed(6);
                    object.qz = (control.object.quaternion.z).toFixed(6);
                    object.qw = (control.object.quaternion.w).toFixed(6);

                    setDatatoPropertiesTab(control.object);
                    // updateSceneDataForElementTransformation(object);

                    if (mode == "translate") {
                        let firebaseRTD = {
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
                        let firebaseRTD = {
                            qx: object.qx,
                            qy: object.qy,
                            qz: object.qz,
                            qw: object.qw
                        };
                        // database.ref('rooms/' + room + '/' + object.name).update(firebaseRTD);
                    }

                    if (mode == "scale") {
                        let firebaseRTD = {
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
        // control.addEventListener('objectChange', () => {
        //         $('#prop-name').val(control.object.name);

        //     });
        /** 
 
    orbitControl = new THREE.OrbitControls( camera, renderer.domElement );
    orbitControl.listenToKeyEvents( window ); // optional
    orbitControl.minDistance = 1;
    orbitControl.maxDistance = 500;
    orbitControl.enableZoom = true;
    */
        scene.add(control);
        control.setSize(0.8);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);
        document.addEventListener('mousewheel', onDocumentMouseWheel, false)
    }

    function animate() {
        requestAnimationFrame(animate);
        deltaTime = clock2.getDelta();
        totalTime += deltaTime;
        // orbitControl.update();
        update();
        renderer.render(scene, camera);
    };

    function update() {
        const delta = clock.getDelta();
        // if (avatarMixer != null) {
        //     avatarMixer.update(delta);
        // };
        // for (const mixer of mixers) {
        //     mixer.update(delta);
        // }

        keyboard.update();

        let translateSpeed = 2; // units per second
        let distance = translateSpeed * deltaTime;
        let rotateSpeed = Math.PI / 4; // radians per second
        let angle = rotateSpeed * deltaTime;

        if (keyboard.isKeyPressed("ArrowUp")) {
            camera.translateZ(-distance);
            camera.updateProjectionMatrix();
        }


        if (keyboard.isKeyPressed("ArrowDown")) {
            camera.translateZ(distance);
            camera.updateProjectionMatrix();
        }


        if (keyboard.isKeyPressed("ArrowLeft")) {
            camera.translateX(-distance);
            camera.updateProjectionMatrix();
        }


        if (keyboard.isKeyPressed("ArrowRight")) {
            camera.translateX(distance);
            camera.updateProjectionMatrix();
        }


        if (keyboard.isKeyPressed("R")) {
            camera.translateY(distance);
            camera.updateProjectionMatrix();
        }


    // if (keyboard.isKeyPressed("R")) {
    //     camera.translateY(distance);
    //     camera.updateProjectionMatrix();
    // }


    // if (keyboard.isKeyPressed("F")) {
    //     camera.translateY(-distance);
    //     camera.updateProjectionMatrix();
    // }


        if (keyboard.isKeyPressed("E")) {
            camera.rotateY(-angle);
            camera.updateProjectionMatrix();
        }


        if (keyboard.isKeyPressed("T")) {
            camera.rotateX(angle);
            camera.updateProjectionMatrix();
        }


    // if (keyboard.isKeyPressed("T")) {
    //     camera.rotateX(angle);
    //     camera.updateProjectionMatrix();
    // }

    }

    function onDocumentMouseDown(event) {
        // event.preventDefault();
        isMouseDown = true;
        onPointerDownMouseX = event.clientX;
        onPointerDownMouseY = event.clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
    }

    function onDocumentMouseMove(event) {
        // event.preventDefault();

        if (isMouseDown) {
            lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon;
            lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;
            lat = Math.max(-85, Math.min(85, lat));
            phi = THREE.MathUtils.degToRad(90 - lat);
            theta = THREE.MathUtils.degToRad(lon);

            const x = 500 * Math.sin(phi) * Math.cos(theta);
            const y = 500 * Math.cos(phi);
            const z = 500 * Math.sin(phi) * Math.sin(theta);

            camera.lookAt(x, y, z);
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
    }

    function onDocumentMouseUp(event) {

        // event.preventDefault();
        isMouseDown = false;
    }

    function onDocumentMouseWheel(event) {

        // event.preventDefault();
        const fov = camera.fov + event.deltaY * 0.05;
        camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
        camera.updateProjectionMatrix();


    }

    function addImagesToModal(imageFor) {
        $('.libraryModalBody').empty();
        let dbPath = 'testSceneCreation/'
        if (imageFor == 'skybox')
            dbPath += 'SkyboxImages';
        else if (imageFor == 'groundplane')
            dbPath += 'GroundImages'
        else if (imageFor == 'Model')
            dbPath = 'storageinfo/H1FA6FSczoYFLFtv9O1WLP3pguz2/models'
        else if (imageFor == 'Image')
            dbPath = 'storageinfo/H1FA6FSczoYFLFtv9O1WLP3pguz2/images'
        else if (imageFor == 'Video')
            dbPath = 'storageinfo/H1FA6FSczoYFLFtv9O1WLP3pguz2/videos'
        else if (imageFor == 'Guide')
            dbPath += 'Guides'
        else if (imageFor == 'Audio')
            dbPath = 'storageinfo/ypuCOnk4mFWKWG109pnxLx24Rg32/audio'

        database.ref(dbPath).once("value", function(snapshot) {
            let counter = 0;
            var dbData = snapshot.val();
            // console.log(imageFor, dbPath, dbData)
            for (let objKey in dbData) {
                counter += 1;
                let htmlString;
                if (counter % 3 == 1) {
                    $('.libraryModalBody').append($("<br>"));
                    $('.libraryModalBody').append($("<div>", { "class": "row" }));
                }
                if (imageFor == 'Model')
                    htmlString = '<div class="col-md-4">\
                                    <img class="img-responsive" data-imageFor="' + imageFor + '"\
                                         data-modelURL="' + dbData[objKey].url + '" src="' + dbData[objKey].model2dimageURL + '"\
                                         data-modelName="' + objKey + '" data-modelType="' + dbData[objKey].fileType + '" style="width:145px; aspect-ratio: 4/3;"\
                                        alt="Model">\
                                </div>';
                else if (imageFor == 'skybox' || imageFor == 'groundplane')
                    htmlString = '<div class="col-md-4">\
                                    <img class="img-responsive" data-imageFor="' + imageFor + '" src="' + dbData[objKey] + '" style="width:145px; aspect-ratio: 4/3;"\
                                        alt="' + imageFor + '">\
                                </div>';
                else if (imageFor == 'Image')
                    htmlString = '<div class="col-md-4">\
                                    <img class="img-responsive" data-imageFor="' + imageFor + '" data-imageName="' + objKey + '"\
                                        data-imageFormat="' + dbData[objKey].fileType + '" src="' + dbData[objKey].url + '" style="width:145px; aspect-ratio: 4/3;"\
                                        alt="Image">\
                                </div>';
                else if (imageFor == 'Video')
                    htmlString = '<div class="col-md-4">\
                                    <video class="img-responsive" data-imageFor="' + imageFor + '" data-videoName="' + objKey + '"\
                                        data-videoFormat="' + dbData[objKey].fileType + '" src="' + dbData[objKey].url + '" style="width:145px; aspect-ratio: 4/3;"\
                                        alt="Video"></video>\
                                </div>';
                else if (imageFor == 'Guide')
                    htmlString = '<div class="col-md-4">\
                                <div class="img-responsive" data-imageFor="' + imageFor + '" data-guideName="' + objKey + '"\
                                 style="width:145px; aspect-ratio: 4/3; text-align: center; padding: 42px 0; background: wheat; border-radius:10px">' + objKey + '</div>\
                            </div>';
                else if (imageFor == 'Audio')
                    htmlString = '<div class="col-md-4">\
                                    <img class="img-responsive" data-imageFor="' + imageFor + '" data-audioName="' + objKey + '"\
                                    data-audioURL="' + dbData[objKey].url + '" data-audioFormat="' + dbData[objKey].fileType + '" src="' + dbData[objKey].iconURL + '" style="width:145px; aspect-ratio: 4/3;"\
                                    alt="audio">\
                                </div>';

                $('.libraryModalBody').find('div.row:last').append(htmlString);

            }
        });
    }

    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], { type: mimeString });
    };

    const dropArea = document.querySelector('.drag-area');

    let button = dropArea.querySelector('button');
    let input = dropArea.querySelector('input');

    button.onclick = () => {
        input.click();
    }

    input.addEventListener('change', () => {
        var file = input.files[0];
        upload(file);
    });

    // Function for uploading files when user drag and drop them in the Upload Modal
    dropArea.addEventListener("dragover", function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, false);

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        console.log('File is dropped');
        file = e.dataTransfer.files[0];
        upload(file);

    });


    // This function works when the user clicks on the Browse Button in the Upload Modal
    function upload(file) {

        var fileName = file.name;
        var fileExt = fileName.split(".").pop();
        if (fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'png') {
            var uploadTask = storageRef.child(uid_firebase + '/images/' + fileName).put(file);
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function(snapshot) {
                dropArea.querySelector('header').innerHTML = 'Uploading your Files...';
                dropArea.querySelector('#or').style.display = 'none';
                dropArea.querySelector('#btn').style.display = 'none';
                var progress = parseInt((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                progress += "%";
                document.querySelector('#model_load_bar_container').style.display = 'block';
                $("#model_load_bar").css("width", progress);
                $('#model_load_bar_percent').text(progress);
                console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100) + '% uploaded');

                // var progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
                // console.log(progress);

            }, function(e) {

            }, function() {
                console.log('Upload Completed');
                $("#uploadModal").modal('hide');
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    console.log(downloadURL);
                    database.ref('storageinfo/' + uid_firebase + '/images/' + file.name.split(".")[0]).set({
                        fileType: file.name.split(".").pop(),
                        url: downloadURL
                    });
                    console.log('Database Updated');
                });
                swal(
                    'File uploaded Successfully!!',
                    'Uploaded File has been stored in your account',
                    'success'
                ).catch(swal.noop)
            })
        } else if (fileExt === 'pdf') {
            var uploadTask = storageRef.child(uid_firebase + '/documents/' + fileName).put(file);
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function(snapshot) {
                // var progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
                // console.log(progress);

                dropArea.querySelector('header').innerHTML = 'Uploading your Files...';
                dropArea.querySelector('#or').style.display = 'none';
                dropArea.querySelector('#btn').style.display = 'none';

                var progress = parseInt((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                progress += "%";
                $("#model_load_bar_container").show();
                $("#model_load_bar").css("width", progress);
                $('#model_load_bar_percent').text(progress);
                console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100) + '% uploaded');

            }, function(e) {

            }, function() {
                console.log('Upload Completed');
                $("#uploadModal").modal('hide');
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    console.log(downloadURL);
                    database.ref('storageinfo/' + uid_firebase + '/documents/' + file.name.split(".")[0]).set({
                        fileType: file.name.split(".").pop(),
                        url: downloadURL
                    });
                    console.log('Database Updated');
                });
                swal(
                    'File uploaded Successfully!!',
                    'Uploaded File has been stored in your account',
                    'success'
                ).catch(swal.noop)
            })

        } else if (fileExt === 'mp3' || fileExt === 'wav' || fileExt === 'ogg') {
            var uploadTask = storageRef.child(uid_firebase + '/audio/' + fileName).put(file);
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function(snapshot) {
                // var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                // console.log(progress);

                dropArea.querySelector('header').innerHTML = 'Uploading your Files...';
                dropArea.querySelector('#or').style.display = 'none';
                dropArea.querySelector('#btn').style.display = 'none';

                var progress = parseInt((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                progress += "%";
                $("#model_load_bar_container").show();
                $("#model_load_bar").css("width", progress);
                $('#model_load_bar_percent').text(progress);
                console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100) + '% uploaded');

            }, function(e) {

            }, function() {
                console.log('Upload Completed');
                $("#uploadModal").modal('hide');
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    console.log(downloadURL);
                    database.ref('storageinfo/' + uid_firebase + '/audio/' + file.name.split(".")[0]).set({
                        fileType: file.name.split(".").pop(),
                        url: downloadURL
                    });
                    console.log('Database Updated');
                });
                swal(
                    'File uploaded Successfully!!',
                    'Uploaded File has been stored in your account',
                    'success'
                ).catch(swal.noop)
            })
        } else if (fileExt === 'mp4' || fileExt === 'webm' || fileExt === 'mov') {
            var uploadTask = storageRef.child(uid_firebase + '/videos/' + fileName).put(file);
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function(snapshot) {
                // var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                // console.log(progress);

                dropArea.querySelector('header').innerHTML = 'Uploading your Files...';
                dropArea.querySelector('#or').style.display = 'none';
                dropArea.querySelector('#btn').style.display = 'none';

                var progress = parseInt((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                progress += "%";
                $("#model_load_bar_container").show();
                $("#model_load_bar").css("width", progress);
                $('#model_load_bar_percent').text(progress);
                console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100) + '% uploaded');

            }, function(e) {

            }, function() {
                console.log('Upload Completed');
                $("#uploadModal").modal('hide');
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    console.log(downloadURL);
                    database.ref('storageinfo/' + uid_firebase + '/videos/' + file.name.split(".")[0]).set({
                        fileType: file.name.split(".").pop(),
                        url: downloadURL
                    });
                    console.log('Database Updated');
                });
                swal(
                    'File uploaded Successfully!!',
                    'Uploaded File has been stored in your account',
                    'success'
                ).catch(swal.noop)
            })
        } else {
            var uploadTask = storageRef.child(uid_firebase + '/models/' + fileName).put(file);
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function(snapshot) {

                dropArea.querySelector('header').innerHTML = 'Uploading your Files...';
                dropArea.querySelector('#or').style.display = 'none';
                dropArea.querySelector('#btn').style.display = 'none';

                var progress = parseInt((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                progress += "%";
                $("#model_load_bar_container").show();
                $("#model_load_bar").css("width", progress);
                $('#model_load_bar_percent').text(progress);
                console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100) + '% uploaded');
                // var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                // console.log(progress);

            }, function(e) {

            }, function() {
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    var viewer;
                    console.log("File is model");
                    let div_assetEle = document.createElement('div');
                    console.log('div_assetEle created');
                    let bbl_el = document.createElement('babylon');
                    console.log('bbl_el created');
                    div_assetEle.setAttribute('class', 'assetElement');
                    bbl_el.setAttribute('id', 'bbl_preview');
                    div_assetEle.appendChild(bbl_el);
                    $('#model-preview').append(div_assetEle);
                    var s = document.createElement('script');
                    s.setAttribute('src', "https://preview.babylonjs.com/viewer/babylon.viewer.js");
                    s.setAttribute('crossorigin', 'anonymous');
                    div_assetEle.appendChild(s);
                    $('#openAttachmentModal').modal('show');
                    $('#uploadModal').modal('hide');
                    $('#model-preview-div').show();
                    s.onload = function() {
                        let req_el = document.getElementById('bbl_preview');
                        viewer = new BabylonViewer.DefaultViewer(req_el, {
                            model: downloadURL,
                            camera: {
                                behaviors: {
                                    autoRotate: {
                                        idleRotationSpeed: 0
                                    }
                                }
                            },
                        });
                        console.log("Viewer:", viewer);
                    };
                    $('#confirmModelUpload').off();
                    $('#cancelModelUpload').off();
                    console.log('reached 1st stage');
                    $('#confirmModelUpload').on('click', function() {
                        console.log(file);
                        if (viewer.sceneManager.scene.activeCamera) {
                            console.log("Creating screenshot");
                            BABYLON.Tools.CreateScreenshotUsingRenderTarget(
                                viewer.sceneManager.scene.getEngine(),
                                viewer.sceneManager.scene.activeCamera, { width: 600, height: 400 },
                                function(data) {
                                    storageRef
                                        .child(uid_firebase + '/model2dimages/' + file.name.split(".")[0] + '.png')
                                        .put(dataURItoBlob(data))
                                        .then((snapshot) => {
                                            snapshot.ref.getDownloadURL().then(function(downloadURL2) {
                                                database.ref('storageinfo/' + uid_firebase + '/models/' + file.name.split(".")[0]).set({
                                                    fileName: file.name.split(".")[0],
                                                    fileType: file.name.split(".").pop(),
                                                    url: downloadURL,
                                                    model2dimageURL: downloadURL2
                                                });
                                                // listAssets();
                                            });
                                        });
                                    $('#openAttachmentModal').modal('hide');
                                    swal(
                                        'File uploaded Successfully!!',
                                        'Uploaded File has been stored in your account',
                                        'success'
                                    ).catch(swal.noop);
                                    $('#model-preview').empty();
                                }
                            );
                        }
                    });
                    $('#cancelModelUpload').on('click', function() {
                        storageRef.child(uid_firebase + '/models/' + file.name).delete().then(() => {
                            $('#openAttachmentModal').modal('hide');
                            swal(
                                'Upload Cancelled!',
                                'File upload is cancelled',
                                'error'
                            ).catch(swal.noop);
                            $('#model-preview').empty();
                        }).catch((error) => {
                            console.log("Uh-oh, an error occurred!");
                        });
                        $('#openAttachmentModal').modal({
                            backdrop: 'static',
                            keyboard: false
                        });

                    });




                })
            })
        }
    }

    function loadModelIntoScene(modelURL, modelName, modelType) {
        refCube.scale.set(1, 1, 1);
        const loader = new THREE.GLTFLoader();
        const onLoad = (gltf, position) => {
            const model = gltf.scene;
            // getModelMeshes(model, modelName);
            // modelMeshes[modelName]['isDispersed'] = isdispersed;

            model.traverse(function(node) {

                if (node.isMesh || node.isLight) node.castShadow = true;
                if (node.isMesh || node.isLight) node.receiveShadow = true;

            });

            const animation = gltf.animations[0];
            // console.log(gltf.animations);
            // console.log(gltf);
            const mixer = new THREE.AnimationMixer(model);
            mixers.push(mixer);
            if (animation) {
                const action = mixer.clipAction(animation);
                action.play();
            }

            var allParent = new THREE.Object3D();
            allParent.name = "allParent";
            for (var child in model.children) {
                allParent.add(model.children[child]);
            }
            model.children = [];
            model.add(allParent);
            var bounds = new THREE.Box3();
            bounds.setFromObject(model);
            var boundsSize = new THREE.Vector3();
            bounds.getSize(boundsSize);

            var refBounds = new THREE.Box3();
            refBounds.setFromObject(refCube);
            var refBoundsSize = new THREE.Vector3();
            refBounds.getSize(refBoundsSize);

            var newScale = new THREE.Vector3();
            newScale = new THREE.Vector3(refBoundsSize.x / boundsSize.x, refBoundsSize.y / boundsSize.y, refBoundsSize.z / boundsSize.z);

            var scale = Math.min(newScale.x, newScale.y, newScale.z);
            allParent.scale.set(scale, scale, scale);

            var newBounds = new THREE.Box3();
            newBounds.setFromObject(model);
            var center = new THREE.Vector3();
            newBounds.getCenter(center);
            allParent.position.sub(model.worldToLocal(center));

            const group = new THREE.Object3D();
            var customData = { "type": "3DModel", "format": modelType, "isLayerElement": true, url: modelURL };
            group.userData = customData;
            group.name = modelName;
            group.add(model);
            var cwd = new THREE.Vector3();
            camera.getWorldDirection(cwd);
            cwd.multiplyScalar(0.3);
            cwd.add(camera.position);
            group.scale.set(1, 1, 1);
            group.position.set(cwd.x, cwd.y, cwd.z);
            group.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);
            scene.add(group);

            control.detach();
            control.attach(group);
            document.removeEventListener('mousemove', onDocumentMouseMove, false);
            document.removeEventListener('mousedown', onDocumentMouseDown, false);
            document.removeEventListener('mouseup', onDocumentMouseUp, false);
            document.removeEventListener('mousewheel', onDocumentMouseWheel, false);
            sceneElementsData[modelName] = {
                px: cwd.x,
                py: cwd.y,
                pz: cwd.z,
                sx: 1,
                sy: 1,
                sz: 1,
                qx: camera.quaternion.x,
                qy: camera.quaternion.y,
                qz: camera.quaternion.z,
                qw: camera.quaternion.w,
                elementType: 'model',
                url: modelURL
            }

            $('#prop-name').val(modelName);
            $("#layers").append('<div class="layerEntry" data-layerName="' + modelName + '" data-layerType="ground" style="font-size:14px; color:rgb(170, 170, 170);margin-left:10px; margin-bottom:10px;"><i class="fas fa-sm fa-cube" style="margin-right:5px;"></i>' + modelName + '</div>');
            // if (isdispersed == 'true') disperseMeshes(group.name);
            // callback();
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
        const onError = (errorMessage) => {
            alert(errorMessage);
        };
        // load the first model. Each model is loaded asynchronously,
        const position = new THREE.Vector3(0, 0, 0);
        loader.load(modelURL, gltf => onLoad(gltf, position), onProgress, onError);
    }

    function loadImageIntoScene(imgURL, imgName, imgFormat) {
        let textureImage = new THREE.TextureLoader().load(imgURL);
        let geomImage = new THREE.PlaneGeometry(0.3, 0.2);
        let materialImage = new THREE.MeshBasicMaterial({ map: textureImage, side: THREE.DoubleSide });
        let meshImage = new THREE.Mesh(geomImage, materialImage);
        meshImage.name = imgName;
        meshImage.userData = { "type": "image", "format": imgFormat, "isLayerElement": true, url: imgURL };
        scene.add(meshImage);
        var cwd = new THREE.Vector3();
        camera.getWorldDirection(cwd);
        cwd.multiplyScalar(0.3);
        cwd.add(camera.position);
        meshImage.scale.set(1, 1, 1);
        meshImage.position.set(cwd.x, cwd.y, cwd.z);
        meshImage.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);

        control.detach();
        control.attach(meshImage)
        sceneElementsData[imgName] = {
            px: cwd.x,
            py: cwd.y,
            pz: cwd.z,
            sx: 1,
            sy: 1,
            sz: 1,
            qx: camera.quaternion.x,
            qy: camera.quaternion.y,
            qz: camera.quaternion.z,
            qw: camera.quaternion.w,
            elementType: 'Image',
            url: imgURL,
            fileType: imgFormat
        };

        $('#prop-name').val(imgName);
        $("#layers").append('<div class="layerEntry" data-layerName="' + imgName + '" data-layerType="image" style="font-size:14px; color:rgb(170, 170, 170);margin-left:10px; margin-bottom:10px;"><i class="far fa-sm fa-image" style="margin-right:5px;"></i>' + imgName + '</div>');
    }

    function loadVideoIntoScene(vidURL, vidName, videoFormat) {
        let videoElem = document.createElement('video');
        videoElem.id = vidName;
        videoElem.crossOrigin = "anonymous"
        videoElem.src = vidURL;
        videoElem.load(); // must call after setting/changing source
        videoElem.style.display = "none";
        // videoElem.ontimeupdate = function () {
        // 	console.log(videoElem.currentTime);
        // 	database.ref('rooms/' + room + '/' + fileName).update(
        // 		{
        // 			currentSeek: videoElem.currentTime
        // 		}
        // 	);
        // };

        let textureVideoElem = new THREE.VideoTexture(videoElem);
        let geometryVideoElem = new THREE.PlaneGeometry(0.3, 0.2);
        let materialVideoElem = new THREE.MeshBasicMaterial({ map: textureVideoElem, side: THREE.DoubleSide });
        let meshVideoElem = new THREE.Mesh(geometryVideoElem, materialVideoElem);
        meshVideoElem.name = vidName.toString();
        let videoCustomData = { "type": "video", "format": videoFormat, "isLayerElement": true, url: vidURL };
        meshVideoElem.userData = videoCustomData;

        let textureImage = new THREE.TextureLoader().load("/images/play.png");
        let geomImage = new THREE.PlaneGeometry(0.3, 0.2);
        let materialImage = new THREE.MeshBasicMaterial({ map: textureImage, side: THREE.DoubleSide });
        let meshImage = new THREE.Mesh(geomImage, materialImage);
        meshImage.name = vidName;

        scene.add(meshVideoElem);

        let cwd = new THREE.Vector3();
        camera.getWorldDirection(cwd);
        cwd.multiplyScalar(0.3);
        cwd.add(camera.position);
        meshVideoElem.scale.set(1, 1, 1);
        meshVideoElem.position.set(cwd.x, cwd.y, cwd.z);
        meshVideoElem.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);
        document.body.appendChild(videoElem);
        videoElem.play();
        control.detach();
        control.attach(meshVideoElem)
        sceneElementsData[vidName] = {
            px: 0,
            py: 0,
            pz: -0.3,
            sx: 1,
            sy: 1,
            sz: 1,
            qx: 0,
            qy: 0,
            qz: 0,
            qw: 1,
            elementType: 'Video',
            url: vidURL,
            fileType: videoFormat
        };

        $('#prop-name').val(vidName);
        $("#layers").append('<div class="layerEntry" data-layerName="' + vidName + '" data-layerType="image" style="font-size:14px; color:rgb(170, 170, 170);margin-left:10px; margin-bottom:10px;"><i class="fas fa-sm fa-film" style="margin-right:5px;"></i>' + vidName + '</div>');
    }

    function loadGuideIntoScene(guideName) {
        let data = [];

        // database.ref("testSceneCreation/Guides/" + guideName).once("value", snapshot => {
        database.ref("testSceneCreation/Guides/NewTestGuide").once("value", snapshot => {
            let layerList = snapshot.val();
            database.ref("testSceneCreation/Layers/").once("value", snapshot2 => {
                let layersData = snapshot2.val();
                for (let index in layerList) {
                    data.push({
                        name: layerList[index],
                        data: layersData[layerList[index]]
                    })
                }
            });
        }).then(() => {
            console.log(data);
            console.log("HO gaya khatam");
            refCube.scale.set(1, 1, 1);
            const loader = new THREE.GLTFLoader();
            const onLoad = (gltf, position) => {
                const model = gltf.scene;
                // getModelMeshes(model, modelName);
                // modelMeshes[modelName]['isDispersed'] = isdispersed;

                model.traverse(function(node) {

                    if (node.isMesh || node.isLight) node.castShadow = true;
                    if (node.isMesh || node.isLight) node.receiveShadow = true;

                });

                var allParent = new THREE.Object3D();
                allParent.name = "allParent";
                for (var child in model.children) {
                    allParent.add(model.children[child]);
                }
                model.children = [];
                model.add(allParent);
                var bounds = new THREE.Box3();
                bounds.setFromObject(model);
                var boundsSize = new THREE.Vector3();
                bounds.getSize(boundsSize);

                var refBounds = new THREE.Box3();
                refBounds.setFromObject(refCube);
                var refBoundsSize = new THREE.Vector3();
                refBounds.getSize(refBoundsSize);

                var newScale = new THREE.Vector3();
                newScale = new THREE.Vector3(refBoundsSize.x / boundsSize.x, refBoundsSize.y / boundsSize.y, refBoundsSize.z / boundsSize.z);

                var scale = Math.min(newScale.x, newScale.y, newScale.z);
                allParent.scale.set(scale, scale, scale);

                var newBounds = new THREE.Box3();
                newBounds.setFromObject(model);
                var center = new THREE.Vector3();
                newBounds.getCenter(center);
                allParent.position.sub(model.worldToLocal(center));

                const group = new THREE.Object3D();
                var customData = { "type": "Guide", "isLayerElement": false, guideData: data };
                group.userData = customData;
                group.name = guideName;
                group.add(model);
                group.scale.set(0.7, 0.7, 0.7);
                group.position.set(0, 0, -0.3);
                group.quaternion.set(0, 0, 0, 1);
                scene.add(group);

                control.detach();
                control.attach(group);
                sceneElementsData[guideName] = {
                    px: 0,
                    py: 0,
                    pz: -0.3,
                    sx: 0.7,
                    sy: 0.7,
                    sz: 0.7,
                    qx: 0,
                    qy: 0,
                    qz: 0,
                    qw: 1,
                    elementType: 'model'
                }

                $('#prop-name').val(guideName);
                $("#layers").append('<div class="layerEntry" data-layerName="' + guideName + '" data-layerType="Guide" style="font-size:14px; color:rgb(170, 170, 170);margin-left:10px; margin-bottom:10px;"><i class="fas fa-sm fa-book-open" style="margin-right:5px;"></i>' + guideName + '</div>');
                // if (isdispersed == 'true') disperseMeshes(group.name);
                // callback();
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
            const onError = (errorMessage) => {
                alert(errorMessage);
            };
            // load the first model. Each model is loaded asynchronously,
            const position = new THREE.Vector3(0, 0, 0);
            loader.load('/images/Guide.gltf', gltf => onLoad(gltf, position), onProgress, onError);
        });
    }

    function loadAudioIntoScene(audioname, audiourl) {
        console.log("consoling for audio elements");
        console.log(audioname, audiourl);
        refCube.scale.set(1, 1, 1);
        const loader = new THREE.GLTFLoader();
        const onLoad = (gltf, position) => {
            const model = gltf.scene;
            // getModelMeshes(model, modelName);
            // modelMeshes[modelName]['isDispersed'] = isdispersed;

            model.traverse(function(node) {

                if (node.isMesh || node.isLight) node.castShadow = true;
                if (node.isMesh || node.isLight) node.receiveShadow = true;

            });

            const animation = gltf.animations[0];
            // console.log(gltf.animations);
            // console.log(gltf);
            const mixer = new THREE.AnimationMixer(model);
            mixers.push(mixer);
            if (animation) {
                const action = mixer.clipAction(animation);
                action.play();
            }

            var allParent = new THREE.Object3D();
            allParent.name = "allParent";
            for (var child in model.children) {
                allParent.add(model.children[child]);
            }
            model.children = [];
            model.add(allParent);
            var bounds = new THREE.Box3();
            bounds.setFromObject(model);
            var boundsSize = new THREE.Vector3();
            bounds.getSize(boundsSize);

            var refBounds = new THREE.Box3();
            refBounds.setFromObject(refCube);
            var refBoundsSize = new THREE.Vector3();
            refBounds.getSize(refBoundsSize);

            var newScale = new THREE.Vector3();
            newScale = new THREE.Vector3(refBoundsSize.x / boundsSize.x, refBoundsSize.y / boundsSize.y, refBoundsSize.z / boundsSize.z);

            var scale = Math.min(newScale.x, newScale.y, newScale.z);
            allParent.scale.set(scale, scale, scale);

            var newBounds = new THREE.Box3();
            newBounds.setFromObject(model);
            var center = new THREE.Vector3();
            newBounds.getCenter(center);
            allParent.position.sub(model.worldToLocal(center));

            const group = new THREE.Object3D();
            var customData = { "type": "3DModel", "format": "glb", "isLayerElement": true, url: "https://firebasestorage.googleapis.com/v0/b/ajnasuite.appspot.com/o/ypuCOnk4mFWKWG109pnxLx24Rg32%2Fmodels%2FaudioSource.glb?alt=media&token=1e36ffa4-7f4e-4e5c-84fc-4fa76ec7ab38" };
            group.userData = customData;
            group.name = audioname;
            group.add(model);
            var cwd = new THREE.Vector3();
            camera.getWorldDirection(cwd);
            cwd.multiplyScalar(0.3);
            cwd.add(camera.position);
            group.scale.set(1, 1, 1);
            group.position.set(cwd.x, cwd.y, cwd.z);
            group.quaternion.set(camera.quaternion.x, camera.quaternion.y, camera.quaternion.z, camera.quaternion.w);
            scene.add(group);
            attachaudio(audioname, audiourl);
            control.detach();
            control.attach(group);
            sceneElementsData[audioname] = {
                px: cwd.x,
                py: cwd.y,
                pz: cwd.z,
                sx: 1,
                sy: 1,
                sz: 1,
                qx: camera.quaternion.x,
                qy: camera.quaternion.y,
                qz: camera.quaternion.z,
                qw: camera.quaternion.w,
                elementType: 'model',
                url: audiourl
            }

            $('#prop-name').val(modelName);
            $("#layers").append('<div class="layerEntry" data-layerName="' + audioname + '" data-layerType="ground" style="font-size:14px; color:rgb(170, 170, 170);margin-left:10px; margin-bottom:10px;"><i class="fas fa-sm fa-cube" style="margin-right:5px;"></i>' + audioname + '</div>');
            // if (isdispersed == 'true') disperseMeshes(group.name);
            // callback();
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
        const onError = (errorMessage) => {
            alert(errorMessage);
        };
        // load the first model. Each model is loaded asynchronously,
        const position = new THREE.Vector3(0, 0, 0);
        loader.load("https://firebasestorage.googleapis.com/v0/b/ajnasuite.appspot.com/o/ypuCOnk4mFWKWG109pnxLx24Rg32%2Fmodels%2FaudioSource.glb?alt=media&token=1e36ffa4-7f4e-4e5c-84fc-4fa76ec7ab38", gltf => onLoad(gltf, position), onProgress, onError);

    }

    let elementPropertiesHTML = {

        groundplaneElement: '<div class="nameModel">\
                          <span>Name: </span>\
                          <input type="text" id="prop-name">\
                        </div>\
                        <div class="selectGroundPlane">\
                          <span class="groundPlaneSpan" style="margin-bottom:20px;">GroundPlane:</span> <button type="button" id="btn3" class="btn btn-info btn-sm btn-rounded" data-toggle="modal" data-target="#assetLibraryModal" style="background:rgb(58, 64, 72); margin-left:24px; margin-top: 10px; margin-bottom:20px; border: 1px solid white; color:white;">Select Image for Skybox\
                          </button>\
                        </div>',

        skyboxElement: '<div class="nameModel">\
                      <span>Name: </span>\
                      <input type="text" id="prop-name">\
                    </div>\
                    <div class="selectSkybox">\
                       <span class="skyboxSpan" style="margin-bottom:20px;">Skybox:</span> <button type="button" id="btn3" class="btn btn-info btn-sm btn-rounded" data-toggle="modal" data-target="#assetLibraryModal" style="background:rgb(58, 64, 72); margin-left:24px; margin-top: 10px; margin-bottom:20px; border: 1px solid white; color:white;">Select Image for Skybox\
                       </button>\
                    </div>',

        modelElement: '<div class="nameModel">\
                    <span>Name: </span>\
                    <input type="text" id="prop-name">\
                  </div>\
                  <div class="modelSelect" style="margin-bottom:20px;">\
                     <span class="modelSpan">Model:</span> <button type="button" id="btn3" class="btn btn-info btn-sm btn-rounded" data-toggle="modal" data-target="#assetLibraryModal" style="background:rgb(58, 64, 72); margin-top:10px; margin-left:30px; margin-bottom:20px; border: 1px solid white; color:white;">\
                     </button>\
                  </div>\
                  <div class="mode">\
                  <span class="modeSpan">Mode: </span>\
                  <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                  <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                  <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                  <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                  </label>\
              </div>\
                  <div class="transform">\
                    <span id="transformSpan">Transform</span>\
                    <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                </div>\
                <hr style="background-color:slategray">\
                <div class="otherProperties">\
                  <span class="animationSpan">Animation</span>\
                  <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:95px; margin-top:10px; margin-bottom:10px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                  </button>\
                  <br>\
                  <span class="materialSpan">Material and Shader: </span>\
                  <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:10px; margin-top:10px; margin-bottom:10px; border: 1px solid white; color:white;">Default <span class = "caret"></span>\
                  </button>\
                  <br>\
                  <span class="lightTypeSpan">Light: </span>\
                  <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:128px; margin-top:10px; margin-bottom:20px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                  </button>\
                  <br>\
                  <span class="collidableSpan">Collidable</span>\
                  <input type="checkbox" class="collidableInput">\
                </div>',

        audioElement: '<div class="nameModel">\
                    <span>Name: </span>\
                    <input type="text" id="prop-name">\
                  </div>\
                  <div class="mode">\
                  <span class="modeSpan">Mode: </span>\
                  <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                  <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                  <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                  <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                  </label>\
              </div>\
                  <div class="transform">\
                    <span id="transformSpan">Transform</span>\
                    <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                  </div>\
                  <hr style="background-color:slategray">\
                  <div class="audioSelection">\
                    <span class="audioURLSpan">Audio URL</span><input type="text" id="audioURLInput">\
                    <br>\
                    <span class="audioControlSpan">Controls</span>\
                    <input type="checkbox" class="audioControlInput">\
                    <br>\
                    <span class="audioLoopSpan">Loop</span>\
                    <input type="checkbox" class="audioLoopInput">\
                    <br>\
                    <span class="audioPlaySpan">Auto-Play</span>\
                    <input type="checkbox" class="audioPlayInput">\
                    <br>\
                    <span class="volumeSpan">Volume</span>\
                    <input type="range" min="0" max="100" class="volumeInput">\
                    <br>\
                    <span class="refDistanceSpan">Ref Distance</span>\
                    <input type="text" id="refDistanceInput">\
                    <br>\
                    <span class="maxDistanceSpan">Max Distance</span>\
                    <input type="text" id="maxDistanceInput">\
                    <br>\
                    <span class="RolloffSpan">Rolloff Factor</span>\
                    <input type="text" id="rolloffInput">\
                  </div>',


        videoElement: '<div class="nameModel">\
                    <span>Name: </span>\
                    <input type="text" id="prop-name">\
                  </div>\
                  <div class="mode">\
                        <span class="modeSpan">Mode: </span>\
                        <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                        <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                        <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                        <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                        </label>\
                    </div>\
                  <div class="transform">\
                  <span id="transformSpan">Transform</span>\
                  <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                   </div>\
                   <hr style="background-color:slategray">\
                   <div class="videoSelection">\
                   <span class="videoURLSpan">Video URL</span><input type="text" id="videoURLInput">\
                   <br>\
                   <span class="videoControlSpan">Controls</span>\
                   <input type="checkbox" class="videoControlInput">\
                   <br>\
                   <span class="videoLoopSpan">Loop</span>\
                   <input type="checkbox" class="videoLoopInput">\
                   <br>\
                   <span class="videoPlaySpan">Auto-Play</span>\
                   <input type="checkbox" class="videoPlayInput">\
                   <br>\
                   <span class="audioTypeSpan">Audio Type</span>\
                   <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:24px; margin-bottom:20px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                   </button>\
                   <br>\
                   <span class="volumeSpan">Volume</span>\
                   <input type="range" min="0" max="100" class="volumeInput">\
                   <br>\
                   </div>',

        lightElement: '<div class="nameModel">\
                        <span>Name: </span>\
                        <input type="text" id="prop-name">\
                     </div>\
                     <div class="mode">\
                        <span class="modeSpan">Mode: </span>\
                        <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                        <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                        <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                        <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                        </label>\
                    </div>\
                     <div class="transform">\
                        <span id="transformSpan">Transform</span>\
                        <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                     </div>\
                     <hr style="background-color:slategray">\
                     <div class="lightSelection">\
                        <span class="lightTypeSpan">Type: </span>\
                        <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:40px; margin-top:10px; margin-bottom:20px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                        </button>\
                        <br>\
                        <span class="lightColorSpan">Color: </span>\
                        <input type="text" id="lightColorInput">\
                        <br>\
                        <span class="lightIntensitySpan">Intensity: </span>\
                        <input type="text" id="lightIntensityInput">\
                        <br>\
                        <span class="lightRangeSpan">Range: </span>\
                        <input type="text" id="lightRangeInput">\
                        <br>\
                     </div>',

        spawnElement: '<div class="nameModel">\
                    <span>Name: </span>\
                    <input type="text" id="prop-name">\
                  </div>\
                  <div class="mode">\
                    <span class="modeSpan">Mode: </span>\
                    <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                    <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                    <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                    <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                    </label>\
                  </div>\
                  <div class="transform">\
                    <span id="transformSpan">Transform</span>\
                    <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                </div>',

        imageElement: '<div class="nameModel">\
                    <span>Name: </span>\
                    <input type="text" id="prop-name">\
                  </div>\
                  <div class="mode">\
                        <span class="modeSpan">Mode: </span>\
                        <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                        <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                        <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                        <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                        </label>\
                    </div>\
                  <div class="transform">\
                    <span id="transformSpan">Transform</span>\
                    <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                  </div>\
                  <hr style="background-color:slategray">\
                  <div class="imgSelection">\
                    <span class="imageURLSpan">Image URL: </span>\
                    <input type="text" id="imageURLInput">\
                    <br>\
                    <span class="imageLinkSpan">Link Href: </span>\
                    <input type="text" id="imageLinkInput">\
                  </div>',

        annotationElement: '<span class="fontSpan">Text Font: </span>\
                        <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:40px; margin-top:10px; margin-bottom:20px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                        </button>\
                        <br>\
                        <span class="colorSpan">Color</span>\
                        <input type="text" class="colorInput">\
                        <br>\
                        <span class="animationSpan">Animation</span>\
                        <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:40px; margin-top:10px; margin-bottom:10px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                        </button>\
                        <br>\
                        <span class="markSpan">Mark </span>\
                        <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:70px; margin-top:10px; margin-bottom:20px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                        </button>',


        textElement: '<div class="mode">\
                        <span class="modeSpan">Mode: </span>\
                        <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                        <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                        <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                        <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                        </label>\
                    </div>\
                    <div class="transform">\
                    <span id="transformSpan">Transform</span>\
                    <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                 </div>\
                 <hr style="background-color:slategray">\
                 <div class="textSelection">\
                    <span class="fontSpan">Text Font: </span>\
                    <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:40px; margin-top:10px; margin-bottom:20px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                    </button>\
                    <br>\
                    <span class="colorSpan">Color:</span>\
                    <input type="text" class="colorInput">\
                    <br>\
                    </div>'
    }

    function showProperties(eleType) {
        $('#div1').html('');
        $('#div1').append(elementPropertiesHTML[eleType]);
    }

    function raycast(e) {

        //1. sets the mouse position with a coordinate system where the center of the screen is the origin
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        //2. set the picking ray from the camera position and mouse coordinates
        raycaster.setFromCamera(mouse, camera);

        //3. compute intersections
        var intersects = raycaster.intersectObjects(scene.children, true);
        console.log(intersects);

        // if (drawArrow == false) {
        // Not Drawing Arrow..
        for (var i = 0; i < intersects.length; i++) {

            if (intersects[i].object.type == "Mesh") {
                // orbitControl.enabled = false;
                document.removeEventListener('mousemove', onDocumentMouseMove, false);
                document.removeEventListener('mousedown', onDocumentMouseDown, false);
                document.removeEventListener('mouseup', onDocumentMouseUp, false);
                document.removeEventListener('mousewheel', onDocumentMouseWheel, false);
                var internalObject = intersects[i].object;
                if (["image", "video", "doc", "screen"].includes(internalObject.userData.type)) {
                    var selectedModel = scene.getObjectByName(internalObject.name);
                    control.detach();
                    control.attach(selectedModel);
                    break;
                } else {
                    while ((internalObject["type"] != "Scene") && (internalObject["type"] != "Group")) {
                        internalObject = internalObject.parent;
                    }
                    if (internalObject.type == "Group" && internalObject.parent.userData.type == "3DModel") {
                        // $("#tempDiv").hide();
                        // $('#tempDiv img').show();
                        // $("#next").hide();
                        // $("#disperseBtn").show();
                        // $("#restoreBtn").show();
                        // $("#previous").hide();
                        // $("#zoomin").hide();
                        // $("#zoomout").hide();
                        // $("#play").hide();
                        // $("#selectParentBtn").hide();
                        // $("#tempDiv").css({
                        //     position: 'absolute',
                        //     left: e.pageX + 50,
                        //     top: e.pageY + 50,
                        //     display: 'block'
                        // });

                        // $("#x").off('click');
                        var selectedModel = scene.getObjectByName(internalObject.parent.name);
                        control.detach();
                        control.attach(selectedModel);

                        // $("#x").click(function() {
                        //     sendDeleteModel(internalObject.parent.name, room);
                        //     drawArrow = false;
                        // });


                        break;
                    }

                }
            }
            if (i == intersects.length - 1) {
                // orbitControl.enabled = true;
                document.addEventListener('mousemove', onDocumentMouseMove, false);
                document.addEventListener('mousedown', onDocumentMouseDown, false);
                document.addEventListener('mouseup', onDocumentMouseUp, false);
                document.addEventListener('mousewheel', onDocumentMouseWheel, false);
                // $(".toggleOut").fadeOut();
                // $("#tempDiv").css({ display: 'none' });
                if (control.object) {
                    control.detach();
                }
            }
        }


    }
    // }
    // else {
    //     var intersectedModel = raycaster.intersectObject(control.object, true);
    //     if (intersectedModel.length > 0) {
    //         $("#submitAnnotation").off("click");
    //         var intersectedWorld = new THREE.Vector3(intersectedModel[0].point.x, intersectedModel[0].point.y, intersectedModel[0].point.z);
    //         var intersectedLocal = control.object.worldToLocal(intersectedWorld);
    //         $('#openAnnotationModal').modal('show');

    //         $("#submitAnnotation").click(function () {
    //             sendRoomArrow(control.object.name, intersectedLocal.x, intersectedLocal.y, intersectedLocal.z, $('#enterAnnotation').val());
    //             $('#openAnnotationModal').modal('hide');
    //             drawArrow = false;
    //             $('#annotations').attr("src", "/images/annotations.png");
    //             $('#annotations').css("background-color", "");
    //             $("#tempDiv").css({ display: 'none' });
    //         });
    //     }
    // }


    function setDatatoPropertiesTab(sceneObj) {
        $('#prop-pos-x').val((sceneObj.position.x).toFixed(6));
        $('#prop-pos-y').val((sceneObj.position.y).toFixed(6));
        $('#prop-pos-z').val((sceneObj.position.z).toFixed(6));
        $('#prop-rot-x').val((sceneObj.quaternion.x).toFixed(6));
        $('#prop-rot-y').val((sceneObj.quaternion.y).toFixed(6));
        $('#prop-rot-z').val((sceneObj.quaternion.z).toFixed(6));
        $('#prop-rot-w').val((sceneObj.quaternion.w).toFixed(6));
        $('#prop-scale-x').val((sceneObj.scale.x).toFixed(6));
        $('#prop-scale-y').val((sceneObj.scale.y).toFixed(6));
        $('#prop-scale-z').val((sceneObj.scale.z).toFixed(6));
    }

    function updateSceneDataForElementTransformation(transformationData) {
        if ('px' in transformationData) {
            if (!(transformationData.name in sceneElementsData)) sceneElementsData[transformationData.name] = {};
            sceneElementsData[transformationData.name].px = transformationData.px;
            sceneElementsData[transformationData.name].py = transformationData.py;
            sceneElementsData[transformationData.name].pz = transformationData.pz;
        }
        if ('sx' in transformationData) {
            sceneElementsData[transformationData.name].sx = transformationData.sx;
            sceneElementsData[transformationData.name].sy = transformationData.sy;
            sceneElementsData[transformationData.name].sz = transformationData.sz;
        }
        if ('qx' in transformationData) {
            sceneElementsData[transformationData.name].qx = transformationData.qx;
            sceneElementsData[transformationData.name].qy = transformationData.qy;
            sceneElementsData[transformationData.name].qz = transformationData.qz;
            sceneElementsData[transformationData.name].qw = transformationData.qw;
        }
    }

    function addLight() {

        let light = new THREE.DirectionalLight(0xffffff, 1);
        let name;
        // if (lightType == 'directional'){
        //     light = new THREE.DirectionalLight( color, intensity );
        // } else if (lightType == 'ambient'){
        //     light = new THREE.AmbientLight( color, intensity );
        // } else if (lightType == 'spot')
        //     light = new THREE.SpotLight( color, intensity );
        for (let i = 1; i <= 100; i++) {
            name = 'Directional Light ' + i;
            if (!(name in sceneElementsData)) {
                break;
            }
        };
        light.name = name;
        light.position.set(5, 5, 5);
        scene.add(light);
        activeElement = name;

        sceneElementsData[name] = {
            type: 'directional',
            px: 5,
            py: 5,
            pz: 5,
            name: name,
            elementType: "Light"
        }
    }

    function updateLightElement(lightEl, lightProperties) {
        let color = lightProperties.color || 0xffffff,
            intensity = lightProperties.intensity || 1;
        if (lightProperties.type == 'directional') {
            lightEl = new THREE.DirectionalLight(color, intensity);
        } else if (lightProperties.type == 'ambient') {
            lightEl = new THREE.AmbientLight(color, intensity);
        } else if (lightProperties.type == 'spot') {
            lightEl = new THREE.SpotLight(color, intensity);
        }

        if ((px in lightProperties) && (py in lightProperties) && (pz in lightProperties)) {
            lightEl.position.set(px, py, pz);
        }

        sceneElementsData['Light'] = {
            type: 'directional',
            px: 5,
            py: 5,
            pz: 5,
            elementType: "Light"
        }
    }

    function togglecolor() {
        var element = document.getElementById("modebtn1");
        var element2 = document.getElementById("modebtn2");
        var element3 = document.getElementById("modebtn3");
        element2.classList.remove('blueBackground');
        element2.classList.add('blackBackground');
        element3.classList.remove('blueBackground');
        element3.classList.add('blackBackground');
        element.classList.add('blueBackground');
    }

    function togglecolor1() {
        var element = document.getElementById("modebtn1");
        var element2 = document.getElementById("modebtn2");
        var element3 = document.getElementById("modebtn3");
        element.classList.remove('blueBackground');
        element.classList.add('blackBackground');
        element3.classList.remove('blueBackground');
        element3.classList.add('blackBackground');
        element2.classList.add('blueBackground');

    }

    function togglecolor2() {
        var element = document.getElementById("modebtn1");
        var element2 = document.getElementById("modebtn2");
        var element3 = document.getElementById("modebtn3");
        element.classList.remove('blueBackground');
        element.classList.add('blackBackground');
        element2.classList.remove('blueBackground');
        element2.classList.add('blackBackground');
        element3.classList.add('blueBackground');
    }

    function addStep(textH, textD) {
        var modifiedText = textD.replace(/(.{32})/g, "$1-").split("-");
        console.log(modifiedText);
        var canvasSticky = document.createElement('canvas');
        canvasSticky.style.display = "none";
        canvasSticky.height = 512;
        canvasSticky.width = 768;
        var ctx = canvasSticky.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 768, 512);
        ctx.font = "60px Georgia";
        var i;
        var yPos = 150;
        ctx.fillStyle = 'black';
        ctx.fillText(textH, 40, 70);
        ctx.font = "40px Georgia";
        for (i = 0; i < modifiedText.length; i++) {
            yPos = yPos + 40;
            ctx.fillText(modifiedText[i], 40, yPos);
        }
        var textureSticky = new THREE.CanvasTexture(canvasSticky);
        var geometrySticky = new THREE.PlaneGeometry(0.2, 0.1);
        var materialSticky = new THREE.MeshBasicMaterial({ map: textureSticky });
        var meshSticky = new THREE.Mesh(geometrySticky, materialSticky);
        let textElName;
        for (let i = 1; i <= 100; i++) {
            textElName = 'Text ' + i;
            if (!(textElName in sceneElementsData)) {
                break;
            }
        };
        canvasSticky.id = textElName.replace(" ", "");
        meshSticky.name = textElName;
        var stickyCustomData = { "type": "Step", "isLayerElement": true, heading: textH, desc: textD };
        meshSticky.userData = stickyCustomData;
        scene.add(meshSticky);
        meshSticky.position.x = 0;
        meshSticky.position.y = 0;
        meshSticky.position.z = -0.3;
        meshSticky.quaternion.x = 0;
        meshSticky.quaternion.y = 0;
        meshSticky.quaternion.z = 0;
        meshSticky.quaternion.w = 1;
        meshSticky.scale.set(1, 1, 1);
        document.body.appendChild(canvasSticky);

        $("#layers").append('<div class="layerEntry" data-layerType="text" data-layerName="' + textElName + '" ><i class="fas fa-sm fa-file-alt"></i>' + textElName + '</div>');

        sceneElementsData[textElName] = {
            px: 0,
            py: 0,
            pz: -0.3,
            sx: 1,
            sy: 1,
            sz: 1,
            qx: 0,
            qy: 0,
            qz: 0,
            qw: 1,
            elementType: 'Text',
            textHeading: textH,
            textDesc: textD
        }
    }

    function attachaudio(name, url) {
        const listener = new THREE.AudioListener();
        camera.add(listener);
        const sound = new THREE.PositionalAudio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(url, function(buffer) {
            sound.setBuffer(buffer);
            sound.setRefDistance(1);
            sound.play();
        });
        const audiosource = scene.getObjectByName(name);
        audiosource.add(sound);
        // console.log("!!!!!!!!!!!!!Spatial Audio Instantiated!!!!!!!!!!");
        // console.log(avatarObject);
    }

})();