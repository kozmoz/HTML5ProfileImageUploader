// http://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
$(document).ready(function () {

    var mouseDown = false;
    var $body = $('html');
    var $handle = $('.sc-handle');
    var $track = $('.track');
    var trackOffset = $track.offset().left;
    var trackWidth = $track.width();

    $('.media-drop-slider').on('mousedown', '.sc-handle', function () {
        mouseDown = true;
        $handle.toggleClass('active', true);
    });

    $('html').on('mousemove', function (e) {
        if (mouseDown) {

            var left = e.pageX - trackOffset;
            left = (left < 0) ? 0 : left;
            left = (left > trackWidth) ? trackWidth : left;

            $handle.css('left', left + 'px');
        }
    });

    $('html').on('mouseup', function () {
        mouseDown = false;
        $handle.removeClass('active');
    });


    $("#media-drop, input[type='file']").html5Uploader({
        postUrl:"/uploadbinary",

        /**
         * Image geladen in de browser.
         * @param file File
         */
        onDrop:function (file, isImage) {
            if (isImage) {
                var img = document.createElement("img");
                img.className = 'thumbnail';
                img.onload = imageLoaded;
                //  Reference File object by URL from HTML.
                img.src = (window.URL || window.webkitURL).createObjectURL(file);
            } else {
                window.alert("Bestand wordt niet herkend als afbeelding, probeert u het opnieuw met een ander bestand.")
            }
        },

        onServerSuccess:function (responseText) {
            window.console && console.info("ResponseId ontvangen van server: ", responseText);
            $('#createrecipeform-imageid').val($.trim(responseText));
        }
    });
});

/**
 * Na succesvol inladen, image kleiner tonen.
 */
function imageLoaded() {
    var img = this;
    window.console && console.info('Image loaded:', img);

    window.console && console.info('width: ', img.width);
    window.console && console.info('height: ', img.height);

    var _ret = determineWidthAndHight(img.width, img.height);
    img.width = _ret.width;
    img.height = _ret.height;

    window.console && console.info('width: ', _ret.width);
    window.console && console.info('height: ', _ret.height);

    $("#media-drop div.placeholder").remove();
    $("#media-drop li").empty().append("<a href='#' />").find('a').append(img);
}

/**
 * Bepaal max breedte ne hoogte van image.
 *
 * @param width Originele breedte
 * @param height Originele hoogte
 * @return width en height
 */
function determineWidthAndHight(width, height) {
    if (width > height) {
        if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }
    } else {
        if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
        }
    }
    return {width:width, height:height};
}


$(function () {
    if (true) {
        return;
    }

    var fileTemplate = "<div id=\"{{id}}\">";
    fileTemplate += "<div class=\"progressbar\"></div>";
    fileTemplate += "<div class=\"preview\"></div>";
    fileTemplate += "<div class=\"filename\">{{filename}}</div>";
    fileTemplate += "</div>";

    function slugify(text) {
        text = text.replace(/[^-a-zA-Z0-9,&\s]+/ig, '');
        text = text.replace(/-/gi, "_");
        text = text.replace(/\s/gi, "-");
        return text;
    }

    $("#dropbox").html5Uploader({onClientLoadStart:function (e, file) {
        var upload = $("#upload");
        if (upload.is(":hidden")) {
            upload.show();
        }
        upload.append(fileTemplate.replace(/{{id}}/g, slugify(file.name)).replace(/{{filename}}/g, file.name));
    }, onClientLoad:function (e, file) {
        $("#" + slugify(file.name)).find(".preview").append("<img src=\"" + e.target.result + "\" alt=\"\">");
    }, onServerLoadStart:function (e, file) {
        $("#" + slugify(file.name)).find(".progressbar").progressbar({value:0});
    }, onServerProgress:function (e, file) {
        if (e.lengthComputable) {
            var percentComplete = (e.loaded / e.total) * 100;
            $("#" + slugify(file.name)).find(".progressbar").progressbar({value:percentComplete});
        }
    }, onServerLoad:function (e, file) {
        $("#" + slugify(file.name)).find(".progressbar").progressbar({value:100});
    }});
    $(".download")
        .mousedown(function () {
            $(this).css({"background-image":"url('images/download-clicked.png')"});
        })
        .mouseup(function () {
            $(this).css({"background-image":"url('images/download.png')"});
        });
});

