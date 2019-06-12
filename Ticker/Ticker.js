$(document).ready(function() {
    var headline = $("#headlines");
    var left = headline.offset().left;

    $.ajax({
        url: "data.json",
        success: function(data) {
            var myHtml = "";
            for (var i=0; i<data.length; i++) {
                myHtml += "<a href='" + data[i].href + "'>" + data[i].headline + "</a>";
            }
            headline.html(myHtml);
            animate();
        }
    });

    function animate() {
        left = left - 2;
        var link = $("a").first();
        if (left <= -link.outerWidth()) {
            link.remove();
            headline.append(link);
            left = 0;
        }
        headline.css("left", left + "px");

        a = requestAnimationFrame(animate);
    }
    var a;
    headline.on("mouseenter", function() {
        cancelAnimationFrame(a);
    });
    headline.on("mouseleave", function() {
        animate();
    });
});
