function toggle(element, options) {
    element = $(element);
    if (element.hasClass('sliding')) return;
    else element.addClass('sliding');
    options = typeof options === 'object' ? options : {};
    options.duration = options.duration || 500;
    options.direction = options.direction || 'horizontal';
    options.callback = typeof options.callback === 'function' ? options.callback : function noop(){};
    options.slideDistance = options.direction === 'horizontal' ? element.width() : element.height();
    options.startTime = Date.now();
    var elemOffsets = element.offset();
    options.startLoc = options.direction === 'horizontal' ? (elemOffsets.left || parseFloat(element[0].style.left.replace('px', '')))
        : (elemOffsets.top || parseFloat(element[0].style.top.replace('px', '')));
    var elementStyles = element[0].ownerDocument.defaultView.getComputedStyle(element[0], null);
    var t = elementStyles.getPropertyValue('display') || elementStyles['display'];
    options.open = t === 'none';
    element.css('display', 'block');
    element.css('overflow', 'hidden');

    animate(element, options, options.duration, options.startTime);
    function animate(elem, options, timeRemaining, startTick) {
        var curTick = Date.now(),
            elapsedTicks = curTick - startTick,
            style = options.direction === 'horizontal' ? 'left' : 'top';

        if(options.duration <= elapsedTicks) {
            if(options.open) elem.css(style, (options.startLoc + options.slideDistance)).css('overflow', 'auto').removeClass('sliding');
            else elem.css(style, (options.startLoc - options.slideDistance)).css('display', 'none').removeClass('sliding');
            return;
        }

        timeRemaining -= elapsedTicks;
        var newSlidePos = Math.round((elapsedTicks/options.duration) * options.slideDistance);

        if(options.open) elem.css(style, options.startLoc - options.slideDistance + newSlidePos + elem.width());
        else elem.css(style, options.startLoc + options.slideDistance - newSlidePos - elem.width());
        setTimeout(function animateTimer() {
            animate(elem, options, timeRemaining, startTick);
        }, 33);
    }
}