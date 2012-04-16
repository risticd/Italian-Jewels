$('#main').bind('pageinit', function(event) {
	loadCompany();
    loadEverything();
});

function loadStops(file, days) {
    $.ajax({
        type: "GET",
        url: file,
        dataType: "xml",
        success: function(xml) { loadStop(xml, days); }
    });
}

function loadEverything() {
    $.ajax({
        type: "GET",
        url: "italy.xml",
        dataType: "xml",
        success: parseEverything
    });
}

function loadCompany() {
    $.ajax({
        type: "GET",
        url: "company.xml",
        dataType: "xml",
        success: parseCompany
    });
}

function loadDayTrips(file) {
    $.ajax({
        type: "GET",
        url: file,
        dataType: "json",
        success: parseDayTrips
    });
}

function parseDayTrips(json) {
    var everything = "";
    
    for (i=0; i<json.trips.length; i++) {
        everything += "<strong>" + json.trips[i].name + "</strong>: " + json.trips[i].time + ", $" + json.trips[i].cost + ", " + json.trips[i].days + "</br>";
    }
    var page = 
        "<div data-role='page' id='" + json.location.replace(/\s/g,'') + "'>" +
            "<div data-role='header' data-theme='b'>" +
                "<h3>" + json.location + "</h1>" +
            "</div>" +
            "<div data-role='content' data-theme='b'>" +
                "<h3>Available Day Trips for " + json.location + "</h3>" + 
                "<p>" + everything + "</p>" +
                '<p><a href="index.html" data-role="button" data-transition="slide" data-rel="back" data-direction="reverse">Back</a></p>' + 
            '</div>' +
        "</div>";
    $('body').append(page);
}

function parseEverything(xml) {
    var title = $(xml).find("package").attr('title');
    var cost = $(xml).find("package").attr('baseCost');
    var length = $(xml).find("package").attr('length');
    
    var startYear = $(xml).find("start").attr('year');
    var startMonth = $(xml).find("start").attr('mon');
    var startDay = $(xml).find("start").attr('day');
    var endYear = $(xml).find("end").attr('year');
    var endMonth = $(xml).find("end").attr('mon');
    var endDay = $(xml).find("end").attr('day');
    
    $("#header").append("<h3>" + title + "</h3>");
    $("#content").append("<strong>Tour Length:</strong> " + length + "days</br>");
    $("#content").append("<strong>Tour Price:</strong> $" + cost + "</br>");
    $("#content").append("<strong>Availability Dates:</strong> " + startYear + "-" + startMonth + "-" + startDay + " to " + endYear + "-" + endMonth + "-" + endDay);
    
    $(xml).find("stop").each(function() {
        var days = $(this).attr('day');
        var file = $(this).find('info').text();
        var daytrips_file = $(this).find('daytrips').text();
        
        loadStops(file, days);
        loadDayTrips(daytrips_file);
    });
}
function convertToWeekday(day) {
    if (day == 1) {
        return "Monday";
    } else if (day == 2) {
        return "Tuesday";
    } else if (day == 3) {
        return "Wednesday";
    } else if (day == 4) {
        return "Thursday";
    } else if (day == 5) {
        return "Friday";
    } else if (day == 6) {
        return "Saturday";
    } else if (day == 7) {
        return "Sunday";
    }
}

function loadStop(xml, days) {
    var loc = $(xml).find('location').attr('name');
    var description = $(xml).find("description").text();
    var imageSrc = $(xml).find("img").attr("src");
    var imageAlt = $(xml).find("img").attr('alt');
    var lat = $(xml).find("lat").text();
    var longt = $(xml).find("long").text();
    var table = "<table border='1' cellpadding='5'><tr><td> Month </td><td> MeanHigh </td><td> MeanLow </td><td>MeanPrec</td></tr>";
    var array = days.split(',');
    var normalDays = "";
    
    for (i=0; i<array.length; i++) {        
        normalDays += (i != array.length - 1) ? convertToWeekday(array[i]) + ", " : convertToWeekday(array[i]);
    }
    
    $(xml).find("month").each(function() {
        var month = $(this).find('name').text();
        var meanhigh = $(this).find('meanhigh').text();
        var meanlow = $(this).find('meanlow').text();
        var meanprecip = $(this).find('meanprecip').text();
        
        table += "<tr><td>" + month + "</td><td>" + meanhigh + "</td><td>" + meanlow + "</td><td>" + meanprecip + "</td></tr>";        
    });
    
    table += "</table>";
    
    var output = 
        "<h3>" + loc + " - " + normalDays + "</h3>" +
        "<div data-role='collapsible-set'>" + 
            "<div data-role='collapsible' data-theme='b' data-content-theme='b'>" +
                "<h3>Description</h3>" +
                "<p>" + description + "</p>" +
            "</div>" +
            "<div data-role='collapsible' data-theme='b' data-content-theme='b'>" +
                "<h3>Picture</h3>" +
                "<p><img src='" + imageSrc + "' alt='" + imageAlt + "' /></p>" +
            "</div>" +
            "<div data-role='collapsible' data-theme='b' data-content-theme='b'>" +
                "<h3>Map</h3>" +
                "<p>Google Map</p>" +
            "</div>" +
            "<div data-role='collapsible' data-theme='b' data-content-theme='b'>" +
                "<h3>Weather Report</h3>" +
                "<p>" + table + "</p>" +
            "</div>" + 
            "<div data-role='collapsible' data-theme='b' data-content-theme='b'>" +
                "<h3>Day Trips</h3>" + 
                "<p><a href='#" + loc.replace(/\s/g,'') + "' data-role='button' data-transition='slide'>View Available Day Trips</a>" + 
            "</div>" +
        "</div>";
 
    $("#content").append(output);
    $("#content").trigger("create");
}

function parseCompany(xml){
    var companyName = "<h4>" + $(xml).find("name").text() + "</h4>";
    var companyPhone = "<p>Phone Number: " + $(xml).find("booking-phone").text() + "</p>";
    var companyContact = "<p>Contact Page: <a href='" + $(xml).find("contact-page").text() + "'>" + $(xml).find("contact-page").text() + "</a></p>";
    
    $("#footer").append(companyName);
    $("#footer").append(companyPhone);
    $("#footer").append(companyContact);
}