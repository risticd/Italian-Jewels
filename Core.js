$('#main').bind('pageinit', function(event) {
	core.init();
});

/**
 * Functions responsible for AJAX calls to gather JSON or XML.
 */
var ajax = {
    loadAllStops: function(file, days) {
        $.ajax({
            type: "GET",
            url: file,
            dataType: "xml",
            success: function(xml) { core.parseStop(xml, days); }
        });
    },
    
    loadDayTrips: function(file) {
        $.ajax({
            type: "GET",
            url: file,
            dataType: "json",
            success: core.parseDayTrips
        });
    },
    
    loadCompany: function() {
        $.ajax({
            type: "GET",
            url: "company.xml",
            dataType: "xml",
            success: core.parseCompany
        });
    },
    
    loadTour: function() {
        $.ajax({
            type: "GET",
            url: "italy.xml",
            dataType: "xml",
            success: core.parseTour
        });
    }
};

/**
 * Core parsing functions.
 */
var core = {
    init: function() {
        ajax.loadTour();
        ajax.loadCompany();
    },
    
    /**
     * Parse a Stop in the Tour.
     */
    parseStop: function(xml, days) {
        var loc = $(xml).find('location').attr('name');
        var description = $(xml).find("description").text();
        var imageSrc = $(xml).find("img").attr("src");
        var imageAlt = $(xml).find("img").attr('alt');
        var lat = $(xml).find("lat").text();
        var longt = $(xml).find("long").text();
       
        var table = "<table border='1'><tr><td><strong>Month</strong></td><td><strong>MeanHigh</strong></td><td><strong>MeanLow</strong></td><td><strong>MeanPrec</strong></td></tr>";
        var array = days.split(',');
        var normalDays = "";
        
        for (i=0; i<array.length; i++) {        
            normalDays += (i != array.length - 1) ? core.toWeekday(array[i]) + ", " : core.toWeekday(array[i]);
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
                    "<p><img src='" + imageSrc + "' alt='" + imageAlt + "' width='270px' height='300px' /></p>" +
                "</div>" +
                "<div class='map' data-role='collapsible' data-theme='b' data-content-theme='b' onClick=\"javascript:core.createMap(" + lat + ", " + longt + ", '" + loc + "');\">" +
                    "<h3>Map</h3>" +
                    "<div id='" +loc+"_map_canvas' style='width:270px; height:300px; border: 1px solid #000;'></div>" +
                "</div>" +
                "<div data-role='collapsible' data-theme='b' data-content-theme='b' style='font-size:11px'>" +
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
    },
    
    /**
     * Parse all Day Trips of a Stop.
     */
    parseDayTrips: function(json) {
        var table = "<table border='1' cellpadding='5'><tr><td><strong>Name</strong></td><td><strong>Time</strong></td><td><strong>Cost</strong></td><td><strong>Days Available</strong></td></tr>";
        
        for (i=0; i<json.trips.length; i++) {
            table += "<tr><td>" + json.trips[i].name + "</td><td>" + json.trips[i].time + "</td><td>$" + json.trips[i].cost + "</td><td>" + json.trips[i].days + "</td></tr>";
        }
        
        table += "</table>";
        
        var page = 
            "<div data-role='page' id='" + json.location.replace(/\s/g,'') + "'>" +
                "<div data-role='header' data-theme='b'>" +
                    "<h3>" + json.location + "</h1>" +
                "</div>" +
                "<div data-role='content' data-theme='b'>" +
                    "<h3>Available Day Trips for " + json.location + "</h3>" + 
                    "<p>" + table + "</p>" +
                    '<p><a href="index.html" data-role="button" data-transition="slide" data-rel="back" data-direction="reverse">Back</a></p>' + 
                '</div>' +
            "</div>";
        
        $('body').append(page);
    },
    
    /**
     * Parse Company Information.
     */
    parseCompany: function(xml) {
        var companyName = "<h4>" + $(xml).find("name").text() + "</h4>";
        var companyPhone = "<p>Phone Number: " + $(xml).find("booking-phone").text() + "</p>";
        var companyContact = "<p>Contact Page: <a href='" + $(xml).find("contact-page").text() + "'>" + $(xml).find("contact-page").text() + "</a></p>";
        
        $("#footer").append(companyName);
        $("#footer").append(companyPhone);
        $("#footer").append(companyContact);
    },
    
    /**
     * Parse the whole Tour based on provided file.
     */
    parseTour: function(xml) {
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
            
            ajax.loadAllStops(file, days);
            ajax.loadDayTrips(daytrips_file);
        });
    },
    
    /**
     * Create a Google Maps map.
     * @lat - latitude
     * @longt - longtitude
     * @loc - Stop location
     */
    createMap: function(lat, longt, loc) {
        var myLatLong = new google.maps.LatLng(lat, longt);
        var myOptions = {
            zoom: 10,
            center: myLatLong,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        var map = new google.maps.Map(document.getElementById(loc + "_map_canvas"), myOptions);
        var marker = new google.maps.Marker({
            position: myLatLong,
            map: map,
            title: loc
        });
    },
    
    /**
     * Convert a number into Week day.
     */
    toWeekday: function(day) {
        switch(day) {
            case "1": return "Monday";
            case "2": return "Tuesday";
            case "3": return "Wednesday";
            case "4": return "Thursday";
            case "5": return "Friday";
            case "6": return "Saturday";
            case "7": return "Sunday";
        }
    }
};