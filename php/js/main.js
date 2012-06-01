// http://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
$(document).ready(function () {

    $(".media-drop, input[type='file']").html5Uploader({

        postUrl:'/recipy/myrecipes/upload',

        onDrop:function () {
            $('.media-drop-placeholder *').hide();
            $('.media-drop-placeholder').toggleClass('busyloading', true).css('cursor', 'progress');
        },

        /**
         * Image cropped and scaled.
         */
        onProcessed:function (file, isImage) {
            if (isImage) {

                // Als image geladen is, meteen tonen in placeholder.
                var img = document.createElement("img");
                img.onload = function () {
                    var img = this;
                    img.width = 310;
                    img.height = 278;
                    $('.media-drop-placeholder').removeClass('busyloading').css('cursor', 'auto').hide().after(img);
                };

                //  Reference File object by URL from HTML.
                img.src = (window.URL || window.webkitURL).createObjectURL(file);

            } else {

                // Todo: toon nette foutmelding.
                window.alert("Bestand wordt niet herkend als afbeelding, probeert u het opnieuw met een ander bestand.")
            }
        },

        onServerSuccess:function (responseText) {
            window.console && console.info("ResponseId ontvangen van server: ", responseText);
            $('#createrecipeform-imageid').val($.trim(responseText));
        }
    });
});
