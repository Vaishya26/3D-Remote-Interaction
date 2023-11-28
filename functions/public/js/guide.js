(() => {
    var storageRef, database, displayName, photoURL, uid_firebase;
    $(document).ready(() => {

        if(localStorage.getItem('guideName')) {
            $('#projNameSpan').html("<i class=\"fas fa-sm fa-cloud\" style=\"margin-right:10px;\"></i> " + localStorage.getItem('guideName'));
        }


    })

    function firebaseConfigure() {
        firebase.initializeApp(firebaseConfig);
        storageRef = firebase.storage().ref();
        database = firebase.database();
        firebase.auth().onAuthStateChanged(function (user) {
            if(user) {
                // User is signed in.
                displayName = user.displayName;
                var email = user.email;
                var emailVerified = user.emailVerified;
                photoURL = user.photoURL;
                var isAnonymous = user.isAnonymous;
                uid_firebase = user.uid;
                var providerData = user.providerData;

                fillLayers();
            } else {
                // console.log("user not logged in");
                window.location.assign("/logout");
            }

        });
    }

    function fillLayers() {
        // database.ref("testSceneCreation/Layers").once("value", snapshot => {
        database.ref("storageinfo/" + uid_firebase + "/Layers").once("value", snapshot => {
            let data = snapshot.val();
            console.log(data, "storageinfo/" + uid_firebase + "/Layers/");
            $('.scenes').empty();
            for(let layerName in data) {
                $('.scenes').append('\
                        <div class="layer" data-layername="' + layerName + '">\
                            <div class="layer-img">' + layerName + '</div>\
                            <div class="layerName">' + layerName + '</div>\
                        </div>');
            }
        });
    }
    firebaseConfigure();

    $(document).on('click', '.layer', function () {
        addStep($(this).data('layername'));
    });

    function addStep(layerName) {
        console.log("insideee");
        let nextStepNumber = ($('#guideLayerDiv').children().length) / 2 + 1;
        $('#guideLayerDiv').append('<span class="addedLayerStepSpan">Step ' + nextStepNumber + '</span>\
                                <div class="addedLayer">' + layerName + '</div>');
    }

    $('#saveGuideBtn').on('click', () => {
        let layers = [];
        $('#guideLayerDiv > .addedLayer').each(function () {
            layers.push($(this).html());
        });
        database.ref("storageinfo/" + uid_firebase + "/Guides/" + localStorage.getItem('guideName')).set(layers);
    })

})();