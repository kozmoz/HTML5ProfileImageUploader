// http://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
$(document).ready(function () {

    var settings = $(".media-drop").html5Uploader({

        postUrl: '/recipy/myrecipes/upload',

        /**
         * File dropped / selected.
         */
        onDropped: function (success) {
            if (!success) {
                $('.errormessages').text('Only allowed are image formats jpg, png or gif.');
            } else {
                $('.errormessages').empty();
                $('.media-drop-placeholder > *').hide();
                $('.media-drop-placeholder').toggleClass('busyloading', true).css('cursor', 'progress');
            }
        },

        /**
         * Image cropped and scaled.
         */
        onProcessed: function (canvas) {
            if (canvas) {

                // Remove possible previously loaded image.
                var url = canvas.toDataURL();
                var newImg = document.createElement("img");
                newImg.src = url;

                // Show new image.
                $('#droppedimage').empty().append(newImg);
                $(newImg).css('border', '1px solid red');

            } else {

                // Todo: toon nette foutmelding.
                window.alert("Bestand wordt niet herkend als afbeelding, probeert u het opnieuw met een ander bestand.")
            }
        },

        onUploaded: function (responseText) {
            window.console && console.info("ResponseId ontvangen van server: ", responseText);
            $('#createrecipeform-imageid').val($.trim(responseText));
        }
    });

    $('input[name="targetsize"]').on('change', function () {
        var val = $(this).val();
        if (val == '800,600') {
            settings.cropRatio = 800 / 600;
        } else if (val == '800,800') {
            settings.cropRatio = 1;
        } else if (val == '600,800') {
            settings.cropRatio = 600 / 800;
        }
    });
});
