/**
 * variables : scene, control
 */


const textureLoader = new THREE.TextureLoader()

const woodenTexture = textureLoader.load('/images/textures/WoodenTexture.jpg')
    // const doorColorTexture = textureLoader.load('/images/textures/door/color.jpg')
    // const doorAlphaTexture = textureLoader.load('/images/textures/door/alpha.jpg')
    // const doorAmbientOcclusionTexture = textureLoader.load('/images/textures/door/ambientOcclusion.jpg')
    // const doorHeightTexture = textureLoader.load('/images/textures/door/height.jpg')
    // const doorNormalTexture = textureLoader.load('/images/textures/door/normal.jpg')
    // const doorMetalnessTexture = textureLoader.load('/images/textures/door/metalness.jpg')
    // const doorRoughnessTexture = textureLoader.load('/images/textures/door/roughness.jpg')

const materialOptionObjMapping = {
    'meshbasicmaterial': THREE.MeshBasicMaterial,
    'meshnormalmaterial': THREE.MeshNormalMaterial,
    'meshmatcapmaterial': THREE.MeshMatcapMaterial,
    'meshdepthmaterial': THREE.MeshDepthMaterial,
    'meshstandardmaterial': THREE.MeshStandardMaterial,
}

$('#changeMaterialModal').on('show.bs.modal', function(e) {
    let selectedModel = control.object;
    let meshesList = [];
    $('.meshDropdownOption').remove();
    let getMesh = (obj, unnamedMeshCounter) => {
        if (obj.type == "Mesh") {
            if (!obj.name) {
                obj.name = "internalMesh" + unnamedMeshCounter;
                unnamedMeshCounter += 1;
            }
            obj.userData['main_parent_model_name'] = control.object.name;
            meshesList.push(obj.name);
            $('#selectMesh').append("<option class='meshDropdownOption' value='" + obj.name + "'>" + obj.name + "</option>");
        }
        if (obj.children.length) {
            for (let i = 0; i < obj.children.length; i++) {
                getMesh(obj.children[i], unnamedMeshCounter);
            }
        }
    }
    getMesh(selectedModel, 1);
    // $('#selectMeshValueAll').data('allmesh', JSON.stringify(meshesList));
});

$('#selectMesh').on('change', () => {
    // control.detach();
    // control.attach(scene.getObjectByName($('#selectMesh').val()));

})

$('#selectMaterial').on('change', () => {
    changeMaterial($('#selectMesh').val(), $('#selectMaterial').val());
    ($('#selectMaterial').val() == 'meshstandardmaterial') ? $('#roughnessMetalnessDiv').show(): $('#roughnessMetalnessDiv').hide();
});

function changeMaterial(meshName, materialName) {
    let selectedMesh = scene.getObjectByName(meshName);
    if (materialName == 'meshbasicmaterial') selectedMesh.material = new THREE.MeshBasicMaterial();
    if (materialName == 'meshnormalmaterial') selectedMesh.material = new THREE.MeshNormalMaterial();
    if (materialName == 'meshmatcapmaterial') selectedMesh.material = new THREE.MeshMatcapMaterial();
    if (materialName == 'meshdepthmaterial') selectedMesh.material = new THREE.MeshDepthMaterial();
    if (materialName == 'meshstandardmaterial') selectedMesh.material = new THREE.MeshStandardMaterial();
    if (materialName == 'rawshadermaterial') {
        let fileref = document.createElement('script');
        fileref.setAttribute("type", "x-shader/x-vertex");
        fileref.setAttribute("id", "vshader");
        if (typeof fileref != "undefined") document.getElementsByTagName("head")[0].appendChild(fileref);

        let fileref2 = document.createElement('script')
        fileref2.setAttribute("type", "x-shader/x-fragment")
        fileref2.setAttribute("id", "fshader");
        if (typeof fileref2 != "undefined") document.getElementsByTagName("head")[0].appendChild(fileref2);

        // fetch("https://firebasestorage.googleapis.com/v0/b/ajnasuite.appspot.com/o/H1FA6FSczoYFLFtv9O1WLP3pguz2%2FtestVertex.glsl?alt=media&token=266501e3-ab10-4fe7-9cd5-d9a98456c5cf")
        fetch("/shaders/pencil/testVertex.glsl")
            .then(r => r.text())
            .then(t => { fileref.innerHTML = t })
            .then(() => {
                // fetch("https://firebasestorage.googleapis.com/v0/b/ajnasuite.appspot.com/o/H1FA6FSczoYFLFtv9O1WLP3pguz2%2FtestFragment.glsl?alt=media&token=3ca6d664-e68f-4778-a9e4-29afd2ae2612")
                fetch("/shaders/pencil/testFragment.glsl")
                    .then(r => r.text())
                    .then(t => { fileref2.innerHTML = t })
                    .then(() => {
                        selectedMesh.material = new THREE.ShaderMaterial({
                            // uniforms: {
                            //     // "map": { value: new THREE.TextureLoader().load('/images/textures/circle.png') },
                            //     time: { value: 0.0 }
                            // },
                            vertexShader: document.getElementById('vshader').textContent,
                            fragmentShader: document.getElementById('fshader').textContent
                        });
                    });
            });
    }

    if (!("meshChanges" in Object.keys(control.object.userData))) control.object.userData['meshChanges'] = {};
    if (!(meshName in Object.keys(control.object.userData.meshChanges))) control.object.userData.meshChanges[meshName] = {};
    control.object.userData.meshChanges[meshName]['material'] = materialName;
}

$('.texture-img').on('click', function() {
    let meshName = $('#selectMesh').val();
    let materialName = $('#selectMaterial').val();
    changeMaterial(meshName, materialName);

    let selectedTexture = textureLoader.load(this.src);
    scene.getObjectByName(meshName).material.map = selectedTexture;

    if (!("meshChanges" in Object.keys(control.object.userData))) control.object.userData['meshChanges'] = {};
    if (!(meshName in Object.keys(control.object.userData.meshChanges))) control.object.userData.meshChanges[meshName] = {};
    control.object.userData.meshChanges[meshName]['texture_url'] = this.src;
})


$('#materialColor').on('input', function() {
    scene.getObjectByName($('#selectMesh').val()).material.color = new THREE.Color($('#materialColor').val());

    if (!("meshChanges" in Object.keys(control.object.userData))) control.object.userData['meshChanges'] = {};
    if (!(meshName in Object.keys(control.object.userData.meshChanges))) control.object.userData.meshChanges[meshName] = {};
    control.object.userData.meshChanges[meshName]['material_color'] = $('#materialColor').val();
})

$('#selectRoughness').on('change', function() {
    scene.getObjectByName($('#selectMesh').val()).material.roughness = $('#selectRoughness').val();

    if (!("meshChanges" in Object.keys(control.object.userData))) control.object.userData['meshChanges'] = {};
    if (!(meshName in Object.keys(control.object.userData.meshChanges))) control.object.userData.meshChanges[meshName] = {};
    control.object.userData.meshChanges[meshName]['material_roughness'] = $('#selectRoughness').val();
});

$('#selectMetalness').on('change', function() {
    scene.getObjectByName($('#selectMesh').val()).material.metalness = $('#selectMetalness').val();

    if (!("meshChanges" in Object.keys(control.object.userData))) control.object.userData['meshChanges'] = {};
    if (!(meshName in Object.keys(control.object.userData.meshChanges))) control.object.userData.meshChanges[meshName] = {};
    control.object.userData.meshChanges[meshName]['material_metalness'] = $('#selectMetalness').val();
});

$('#uploadShader').on('change', handleFileSelect);

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    let file = evt.target.files[0];

    // TRial starts here========================
    let metadata = {
        'contentType': file.type
    };

    let fr = new FileReader();
    fr.onload = function() {
        let fileData = fr.result;
        if (fileData.indexOf("// Vertex shader") != -1 && fileData.indexOf("// Fragment shader") != -1) {
            let uploadTask = storageRef.child(uid_firebase + '/shaders/' + file.name).put(file, metadata);

            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, function(snapshot) {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = parseInt((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                progress += "%";
                $("#model_load_bar_container").show();
                $("#model_load_bar").css("width", progress);
                $('#model_load_bar_percent').text(progress);

            }, function(error) {

                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;

                    case 'storage/canceled':
                        // User canceled the upload
                        break;

                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            }, function() {
                // Upload completed successfully
                $("#model_load_bar").css("width", "0%");
                $('#model_load_bar_percent').text("0%");
                $("#model_load_bar_container").hide();

                let fileNameArray = file.name.split('.');
                let fileExt = fileNameArray.pop();
                let fileNamewOExt = fileNameArray.join('.')

                $('#selectShader').append("<option value='" + fileNamewOExt.toLowerCase() + "'>" + fileNamewOExt + "</option>");
                $('#selectShader').val(fileNamewOExt.toLowerCase());

                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    database.ref('storageinfo/' + uid_firebase + '/shaders/' + fileNamewOExt).set({
                        fileName: fileNamewOExt,
                        fileType: "shader",
                        url: downloadURL
                    });

                    swal(
                        'File uploaded Successfully!!',
                        'Uploaded File has been stored in your account',
                        'success'
                    ).catch(swal.noop);

                });

                let dividerIndex = fileData.indexOf("// Fragment shader");
                fileData = fileData.split(/\r\n|\n/)
                let vertexShaderScript = fileData.slice(0, dividerIndex).join('\n');
                let fragmentShaderScript = fileData.slice(dividerIndex, fileData.length - 1).join('\n');

                if ($('#vshader').length) $('#vshader').remove();
                if ($('#fshader').length) $('#fshader').remove();

                let vScriptRef = document.createElement('script');
                vScriptRef.setAttribute("type", "x-shader/x-vertex");
                vScriptRef.setAttribute("id", "vshader");
                if (typeof vScriptRef != "undefined") document.getElementsByTagName("head")[0].appendChild(vScriptRef);

                let fragScriptRef = document.createElement('script')
                fragScriptRef.setAttribute("type", "x-shader/x-fragment")
                fragScriptRef.setAttribute("id", "fshader");
                if (typeof fragScriptRef != "undefined") document.getElementsByTagName("head")[0].appendChild(fragScriptRef);

                vScriptRef.innerHTML = vertexShaderScript;
                fragScriptRef.innerHTML = fragmentShaderScript;

                scene.getObjectByName($('#selectMesh').val()).material = new THREE.RawShaderMaterial({
                    uniforms: {
                        time: { value: 1.0 }
                    },
                    vertexShader: document.getElementById('vshader').textContent,
                    fragmentShader: document.getElementById('fshader').textContent,
                });

            });
        } else {
            swal(
                'File Invalid!',
                'Uploaded File content is not valid',
                'error'
            ).catch(swal.noop);
        }
    }

    fr.readAsText(file);
}

$('#selectShader').on('change', function() {
    // ye complete karle
    fetch($('#selectShader').val())
        .then(r => r.text())
        .then(fileData => {
            let dividerIndex = fileData.indexOf("// Fragment shader");
            fileData = fileData.split(/\r\n|\n/)
            let vertexShaderScript = fileData.slice(0, dividerIndex).join('\n');
            let fragmentShaderScript = fileData.slice(dividerIndex, fileData.length - 1).join('\n');

            if ($('#vshader').length) $('#vshader').remove();
            if ($('#fshader').length) $('#fshader').remove();

            let vScriptRef = document.createElement('script');
            vScriptRef.setAttribute("type", "x-shader/x-vertex");
            vScriptRef.setAttribute("id", "vshader");
            if (typeof vScriptRef != "undefined") document.getElementsByTagName("head")[0].appendChild(vScriptRef);

            let fragScriptRef = document.createElement('script')
            fragScriptRef.setAttribute("type", "x-shader/x-fragment")
            fragScriptRef.setAttribute("id", "fshader");
            if (typeof fragScriptRef != "undefined") document.getElementsByTagName("head")[0].appendChild(fragScriptRef);

            vScriptRef.innerHTML = vertexShaderScript;
            fragScriptRef.innerHTML = fragmentShaderScript;

            scene.getObjectByName($('#selectMesh').val()).material = new THREE.RawShaderMaterial({
                uniforms: {
                    time: { value: 1.0 }
                },
                vertexShader: document.getElementById('vshader').textContent,
                fragmentShader: document.getElementById('fshader').textContent,
            });
        });
})