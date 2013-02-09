// http://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
$(document).ready(function () {

    $('#resetupload').hide().on('click', function () {
        $('#droppedimage').empty();
        $('#dropbox').show();
    });


    var settings = $(".media-drop").html5Uploader({

        postUrl: 'upload.php',
        imageUrl: 'image.php',

        /**
         * File dropped / selected.
         */
        onDropped: function (success) {
            if (!success) {
                $('.errormessages').text('Only allowed are jpg, png or gif images.');
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

                // Hide dropbox.
                $('#dropbox').hide();

                // Button to reset upload box.
                $('#resetupload').show();

                // Reset dropbox for reuse.
                $('.errormessages').empty();
                $('.media-drop-placeholder > *').show();
                $('.media-drop-placeholder').toggleClass('busyloading', false).css('cursor', 'auto');

            } else {

                // Todo: toon nette foutmelding.
                window.alert("Bestand wordt niet herkend als afbeelding, probeert u het opnieuw met een ander bestand.")
            }
        },

        /**
         * Image uploaded.
         *
         * @param success boolean True indicates success
         * @param responseText String Raw server response
         */
        onUploaded: function (success, responseText) {
            if (success) {
                window.alert('Image uploaded successfully: ' + responseText);
            } else {
                window.alert('Image upload failed: ' + responseText);
            }
        },

        /**
         * Progress during upload.
         *
         * @param progress Number Progress percentage
         */
        onUploadProgress: function (progress) {
            window.console && console.log('Upload progress: ' + progress);
        }
    });

    // Target image size selection.
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
