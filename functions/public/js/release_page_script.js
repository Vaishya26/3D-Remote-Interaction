(() =>{

// for input 
$(".field-wrapper .field-placeholder").on("click", function () {
    $(this).closest(".field-wrapper").find("input").focus();
});


$(function () {

    $('#releasesDiv').on('click', function () { window.location.href = '/releases' });
    $('#supportDiv').on('click', function () { window.location.href = '/support' });
    $('#editorDiv').on('click', function () { window.location.href = '/createscene' });
    $('#updateFormDiv').on('click', function () { window.location.href = '/push_update' });

    // accordion toggle collapse
    $('.project-accordion [data-toggle="collapse"]').on('click', function () {
        $(this).find('.toggle-icon').toggleClass('fa-minus-circle fa-plus-circle');
    });

})

// main js script
var date = new Date();
var hour = date.getHours();
if (hour < 12) {
    $("#greeting").text("Good Morning");
} else if (hour < 17) {
    $("#greeting").text("Good Afternoon");
} else {
    $("#greeting").text("Good Evening");
}

$('#homepageDiv').on('click', function () { window.location.href = '/dashboard' });

$(document).mouseup(function (e) {
    var container = $(".editDiv");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
    }
});

$('#releasesTabs a').on('click', function (event) {
    event.preventDefault()
    $(this).tab('show');
});

var database, uid, storageRef, displayName, email, photoUR, isAdmin;
firebase.initializeApp(firebaseConfig);
database = firebase.database();
storageRef = firebase.storage().ref();
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        // console.log(user);
        displayName = user.displayName;
        email = user.email;
        isAdmin = (email == 'ajnasuite@ajnalens.com');
        if (isAdmin) $('#updateFormDiv').css("display", "block");
        var emailVerified = user.emailVerified;
        photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        uid = user.uid;
        var providerData = user.providerData;
        console.log(displayName);
        $('#user_name').append(displayName);
        $('#user-info-name b').text(displayName);
        $('#user-info-email b').text(email);
        $('#user_img').attr('src', photoURL);

        addReleases();


    }
    else {
        console.log("user not logged in");
        firebase.auth().signOut().then(() => {
            window.location.assign("/logout");
        });
    }
});

$('#logoutDiv').on('click', function () {
    firebase.auth().signOut().then(() => {
        window.location.assign("/logout");
    });
})

function addReleases() {
    var monthNumToName = {
        '1': 'Jan',
        '2': 'Feb',
        '3': 'Mar',
        '4': 'Apr',
        '5': 'May',
        '6': 'Jun',
        '7': 'Jul',
        '8': 'Aug',
        '9': 'Sep',
        '10': 'Oct',
        '11': 'Nov',
        '12': 'Dec',
    }
    database.ref('releases/').orderByKey().once("value", snapshot => {
        console.log(snapshot.val(), typeof snapshot.val());
        let index = 1;
        let releases_data = snapshot.val();
        for (let release in releases_data) {
            let release_date_split = release.split("_");
            let release_date = release_date_split[2] + " " + monthNumToName[release_date_split[1]] + " " + release_date_split[0];

            if (releases_data[release].type == "feature")
                anchor_link_html = '<a href="' + releases_data[release].git_link + '">Git Commit</a>';
            else
                anchor_link_html = '<a href="' + releases_data[release].file_link + ' download">' + releases_data[release].file_name + '</a>';

            let release_html = '<div class="panel project-milestone">\
                                    <div class="panel-heading">\
                                        <h4 class="panel-title">\
                                            <a href="#collapse'+ index + '" data-toggle="collapse" data-parent="#accordion">\
                                                <span class="milestone-title"><i class="far fa-plus-square"></i>\
                                                '+ releases_data[release].proj_name + ' v' + releases_data[release].version + '</span>\
                                                <i class="fa fa-plus-circle toggle-icon"></i>\
                                            </a>\
                                        </h4>\
                                    </div>\
                                    <div id="collapse'+ index + '" class="panel-collapse collapse">\
                                        <div class="panel-body">\
                                            <div class="milestone-section">\
                                                <h4 class="milestone-heading">DESCRIPTION</h4>\
                                                <p class="milestone-description">'+ releases_data[release].desc + '</p>\
                                            </div>\
                                            <div class="milestone-section layout-table project-metrics">\
                                                <div class="cell">\
                                                    <div class="main-info-item">\
                                                        <span class="title">RELEASE DATE</span>\
                                                        <span class="value">'+ release_date + '</span>\
                                                    </div>\
                                                </div>\
                                                <div class="cell">\
                                                    <div class="main-info-item">\
                                                        <span class="title">VERSION</span>\
                                                        <span class="value">v'+ releases_data[release].version + '</span>\
                                                    </div>\
                                                </div>\
                                                <div class="cell">\
                                                    <div class="main-info-item">\
                                                        <span class="title">DELIVERABLE</span>\
                                                        <span class="value">\
                                                            <i class="fa fa-file-pdf-o"></i>\
                                                            '+ anchor_link_html + '\
                                                        </span>\
                                                    </div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>';

            if (releases_data[release].type == "feature")
                $('#codereleases > div').prepend(getHTMLString(
                    index,
                    releases_data[release].proj_name,
                    releases_data[release].version,
                    releases_data[release].desc,
                    release_date,
                    anchor_link_html
                ));
            else
                $('#apkreleases > div').prepend(getHTMLString(
                    index,
                    releases_data[release].proj_name,
                    releases_data[release].version,
                    releases_data[release].desc,
                    release_date,
                    anchor_link_html
                ));

            $('#allreleases > div').prepend(getHTMLString(
                'All' + index,
                releases_data[release].proj_name,
                releases_data[release].version,
                releases_data[release].desc,
                release_date,
                anchor_link_html
            ));

            index += 1;
        }
    }).then(() => {
        $('.collapse').collapse('hide');
    })
}

function getHTMLString(index, proj_name, version, desc, release_date, anchor_link_html) {
    return '<div class="panel project-milestone">\
                <div class="panel-heading">\
                    <h4 class="panel-title">\
                        <a href="#collapse'+ index + '" data-toggle="collapse" data-parent="#accordion">\
                            <span class="milestone-title"><i class="far fa-plus-square"></i>\
                            '+ proj_name + ' v' + version + '</span>\
                            <i class="fa fa-plus-circle toggle-icon"></i>\
                        </a>\
                    </h4>\
                </div>\
                <div id="collapse'+ index + '" class="panel-collapse collapse">\
                    <div class="panel-body">\
                        <div class="milestone-section">\
                            <h4 class="milestone-heading">DESCRIPTION</h4>\
                            <p class="milestone-description">'+ desc + '</p>\
                        </div>\
                        <div class="milestone-section layout-table project-metrics">\
                            <div class="cell">\
                                <div class="main-info-item">\
                                    <span class="title">RELEASE DATE</span>\
                                    <span class="value">'+ release_date + '</span>\
                                </div>\
                            </div>\
                            <div class="cell">\
                                <div class="main-info-item">\
                                    <span class="title">VERSION</span>\
                                    <span class="value">v'+ version + '</span>\
                                </div>\
                            </div>\
                            <div class="cell">\
                                <div class="main-info-item">\
                                    <span class="title">DELIVERABLE</span>\
                                    <span class="value">\
                                        <i class="fa fa-file-pdf-o"></i>\
                                        '+ anchor_link_html + '\
                                    </span>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>'
}

})();