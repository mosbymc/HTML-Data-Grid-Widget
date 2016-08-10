function toggle(element, options) {
    element = $(element);
    options = typeof options === 'object' ? options : {};
    options.duration = options.duration || 500;
    options.direction = options.direction || 'horizontal';
    options.callback = typeof options.callback === 'function' ? options.callback : function noop(){};
    options.slideDistance = options.direction === 'horizontal' ? element.width() : element.height();
    var elementStyles = element[0].ownerDocument.defaultView.getComputedStyle(element[0], null);
    options.open = elementStyles.getPropertyValue('display') || elementStyles['display'] === 'none' ? true : false;
    //computed.getPropertyValue( name ) || computed[ name ] : undefined;

    if (element.css('display') === 'none') {
        slideOut(element, options);
    }
    else {
        slideIn(element, options);
    }

    function slideOut(elem, options) {
        animate(elem, options, Date.now());
    }

    function slideIn(elem, options) {
        animate(elem, options, Date.now());
    }

    function animate(elem, options, prevTick) {
        var curTick = Date.now();
        var elapsedTicks = curTick - prevTick;

        var opening = (oID == '') ? null : document.getElementById(oID);
        var closing = (cID == '') ? null : document.getElementById(cID);

        if(options.duration <= elapsedTicks) {
            if(opening != null)
                opening.style.height = ContentHeight + 'px';

            if(closing != null) {
                closing.style.display = 'none';
                closing.style.height = '0px';
            }
            return;
        }

        timeLeft -= elapsedTicks;
        var newClosedHeight = Math.round((timeLeft/TimeToSlide) * ContentHeight);

        if(opening != null) {
            if(opening.style.display != 'block')
                opening.style.display = 'block';
            opening.style.height = (ContentHeight - newClosedHeight) + 'px';
        }

        if(closing != null)
            closing.style.height = newClosedHeight + 'px';

        setTimeout("animate(" + curTick + "," + timeLeft + ",'"
            + cID + "','" + oID + "')", 33);
    }
}

function openTab(divID, height) {
    var openingHeader = $("#" + divID + "Header");
    var closingHeader = $("#" + openAccordion + "Header");
    //var openingSpan = document.getElementById(divID + "Span");
    //var closingSpan = document.getElementById(openAccordion + "Span");

    if(openAccordion == divID) {
        divID = null;
        closingHeader.addClass("closeHeader");
        closingHeader.removeClass("openHeader");
        //closingSpan.className = "downArrow";
    }
    if (openAccordion == null) {
        openingHeader.addClass("openHeader");
        openingHeader.removeClass("closeHeader");
        //openingSpan.className = "upArrow";
    }

    ContentHeight = height;

    setTimeout("animate(" + new Date().getTime() + "," + TimeToSlide + ",'"
        + openAccordion + "','" + divID + "')", 33);

    openingHeader.removeClass("closeHeader");
    openingHeader.addClass("openHeader");
    closingHeader.removeClass("openHeader");
    closingHeader.addClass("closeHeader");
    openAccordion = divID;
}

function animate (lastTick, timeLeft, cID, oID) {
    var openingHeader = document.getElementById(oID + "Header");
    var closingHeader = document.getElementById(cID + "Header");
    var openingSpan = document.getElementById(oID + "Span");
    var closingSpan = document.getElementById(cID + "Span");

    var curTick = new Date().getTime();
    var elapsedTicks = curTick - lastTick;

    var opening = (oID == '') ? null : document.getElementById(oID);
    var closing = (cID == '') ? null : document.getElementById(cID);

    if(timeLeft <= elapsedTicks) {
        if(opening != null)
            opening.style.height = ContentHeight + 'px';

        if(closing != null) {
            closing.style.display = 'none';
            closing.style.height = '0px';
        }
        return;
    }

    timeLeft -= elapsedTicks;
    var newClosedHeight = Math.round((timeLeft/TimeToSlide) * ContentHeight);

    if(opening != null) {
        if(opening.style.display != 'block')
            opening.style.display = 'block';
        opening.style.height = (ContentHeight - newClosedHeight) + 'px';
    }

    if(closing != null)
        closing.style.height = newClosedHeight + 'px';

    setTimeout("animate(" + curTick + "," + timeLeft + ",'"
        + cID + "','" + oID + "')", 33);
    //openingSpan.className = "upArrow";
    //closingSpan.className = "downArrow";
}