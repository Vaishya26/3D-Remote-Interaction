var mobile = (/iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));  
if (mobile) { 
    window.location.href = '/downloadApp'
    // $('.navWrap').css('display', 'none'); // OR you can use $('.navWrap').hide();
}

var today = new Date();
const monthNames3Letter = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var curr_date = today.getDate() +' '+monthNames3Letter[today.getMonth()]+" "+ today.getFullYear();