/*!
 * jQuery HTML5 Uploader 1.1
 *
 * https://github.com/kozmoz/HTML5ProfileImageUploader
 *
 * Based on:
 * - http://www.igloolab.com/jquery-html5-uploader
 * - http://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
 */
(function ($) {

    "use strict";

    // Wait 30 seconds before timeout.
    var MAXIMUM_WAITING_TIME = 30000;

    $.fn.html5Uploader = function (options) {
        var settings = {

            // Settings.
            postUrl: "upload",
            cropRatio: 800 / 600,
            maxLength: 800,
            imageUrl: "image",

            // Callbacks.
            onDropped: null /* Returns boolean (true = accepted, type is image) */,
            onProcessed: null /* Returns Canvas(success) or null */,
            onUploaded: null /* Returns boolean (true = success), responseText */,
            onUploadProgress: null /* Progress during upload, in percentage .*/
        };

        if (options) {
            $.extend(settings, options);
        }

        // Add the dataTransfer property for use with the native `drop` event to capture information about files dropped into the browser window.
        jQuery.event.props.push("dataTransfer");

        var originalSelector = this.selector;
        this.each(function () {
            var $dropElement = $(this);

            // The ondragover event needs to be canceled in Google Chrome and Safari to allow firing the ondrop event.
            // Cancel drop events on body.

            // Toggle dragover class.
            var hasDragoverClass = false;
            $(document).on("dragover", '*', function () {
                if (hasDragoverClass) {
                    $dropElement.removeClass("dragover");
                    hasDragoverClass = false;
                }
                return false;
            });

            // Put "dragover" class at drop area.
            $('body').on("dragover", originalSelector, function () {
                if (!hasDragoverClass) {
                    $dropElement.toggleClass("dragover", true);
                    hasDragoverClass = true;
                }
                return false;
            });

            // Catch file drop.
            $dropElement.bind("drop", function (e) {
                // Returns FileList.
                // https://developer.mozilla.org/en-US/docs/DOM/FileList
                var files = e.dataTransfer.files;
                if (files.length > 0) {

                    // Max 1 file.
                    startProcess(files[0]);
                } else {
                    // Image URL gedropt (Drag'n Drop in Chrome tussen tabbladen).
                    var imageUrl = e.dataTransfer.getData("URL");
                    if (imageUrl) {
                        // Bypass Cross-Origin Resource Sharing.
                        imageUrl = settings.imageUrl + '?url=' + encodeURIComponent(imageUrl);
                        startProcess(imageUrl);
                    }
                }

                $dropElement.removeClass("dragover");
                return false;
            });

            // Attach listener to <input type=file>
            $dropElement.find('input[type="file"]').parent().on('change', 'input', function () {

                // Returns FileList.
                // https://developer.mozilla.org/en-US/docs/DOM/FileList
                var files = this.files;
                if (files.length > 0) {

                    // Reset file input by redrawing it.
                    // http://gusiev.com/2009/04/clear-upload-file-input-field/
                    $(this).parent().html($(this).parent().html());

                    // Max 1 file.
                    startProcess(files[0]);
                }
            });

        });

        /**
         * Start the process of scaling, cropping and uploading.
         *
         * @param fileOrUrl File or image
         */
        function startProcess(fileOrUrl) {
            var callback = function () {
                var canvas = scaleAndCropImage(this);
                var blob = convertCanvasToBlob(canvas);

                // Upload to server.
                realUploadImage(blob);
            };

            var success = false;
            if (typeof fileOrUrl == 'string') {
                // Parameter type is URL (at least is isn't a file).
                success = createImageFromUrl(callback, fileOrUrl);
            } else {
                // Parameter type file.
                success = createImageFromFile(callback, fileOrUrl);
            }

            // Notify listeners.
            settings.onDropped && settings.onDropped(success);
        }

        /**
         * Scale and crop image.
         *
         * @param img HTMLElement Image object
         * @return HTMLElement Canvas element of scaled and cropped image
         */
        function scaleAndCropImage(img) {

            var cropRatio = settings.cropRatio;
            var originalWidth = img.width;
            var originalHeight = img.height;

            // 90 degrees CW or CCW, flip width and height.
            var $img = $(img);
            var orientation = $img.data('orientation') || 0;
            switch (orientation) {
                case 5:
                case 6:
                case 7:
                case 8:
                    cropRatio = 1 / cropRatio;
                    break;
                default:
            }

            // Calculate width and height based on desired X/Y ratio.
            var ret = determineCropWidthAndHeight(cropRatio, originalWidth, originalHeight);
            var cropWidth = ret.width;
            var cropHeight = ret.height;

            // Determine if longest side exceeds max length.
            ret = determineScaleWidthAndHeight(settings.maxLength, cropWidth, cropHeight);
            var scaleWidth = ret.width;
            var scaleHeight = ret.height;
            var scaleRatio = cropWidth / scaleWidth;

            // Crop and scale.
            var x = -1 * (Math.round(((originalWidth - cropWidth) / 2) / scaleRatio));
            var y = -1 * (Math.round(((originalHeight - cropHeight) / 2) / scaleRatio));
            x = Math.min(0, x);
            y = Math.min(0, y);
            var w = Math.round(originalWidth / scaleRatio);
            var h = Math.round(originalHeight / scaleRatio);

            var canvas = document.createElement("canvas");

            // Bepaal de breedte an hoogte, gebaseerd op orientatie.
            switch (orientation) {
                case 5:
                case 6:
                case 7:
                case 8:
                    canvas.width = scaleHeight;
                    canvas.height = scaleWidth;
                    break;
                default:
                    canvas.width = scaleWidth;
                    canvas.height = scaleHeight;
            }

            var ctx = canvas.getContext("2d");
            if (orientation) {
                // Transform canvas coordination according to specified frame size and orientation.
                transformCoordinate(ctx, orientation, scaleWidth, scaleHeight);
            }

            // For now just a white background, in the future possibly background color based on dominating image color?
            ctx.fillStyle = "rgba(255,255,255, 0)";
            ctx.fillRect(0, 0, scaleWidth, scaleHeight);
            ctx.drawImage(img, x, y, w, h);

            // Try to fix IOS6s image squash bug.
            // Test for transparency. This trick only works with JPEGs.
            var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
            if (iOS && $img.data('fileType') == 'image/jpeg') {
                var transparent = detectTransparency(ctx);
                if (transparent) {
                    // Redraw image, doubling the height seems to fix the iOS6 issue.
                    ctx.drawImage(img, x, y, w, h * 2.041);
                }
            }

            // Notify listeners of scaled and cropped image.
            settings.onProcessed && settings.onProcessed(canvas);

            return canvas;
        }

        /**
         * Detect transparency.
         * Fixes a bug which squash image vertically while drawing into canvas for some images.
         *
         * @param ctx HTMLCanvasElement Canvas
         * @return Boolean True als transparent
         */
        function detectTransparency(ctx) {
            var canvas = ctx.canvas;
            var height = canvas.height;

            // Returns pixel data for the specified rectangle.
            var data = ctx.getImageData(0, 0, 1, height).data;

            // Search image edge pixel position in case it is squashed vertically.
            for (var i = 0; i < height; i++) {
                var alphaPixel = data[(i * 4) + 3];
                if (alphaPixel == 0) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Transform canvas coordination according to specified frame size and orientation.
         * Orientation value is from EXIF tag.
         *
         * @param ctx HTMLCanvasElement.context Canvas
         * @param orientation EXIF orientation code
         * @param width Number Width
         * @param height Number Height
         */
        function transformCoordinate(ctx, orientation, width, height) {
            switch (orientation) {
                case 1:
                    // nothing
                    break;
                case 2:
                    // horizontal flip
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                    break;
                case 3:
                    // 180 rotate left
                    ctx.translate(width, height);
                    ctx.rotate(Math.PI);
                    break;
                case 4:
                    // vertical flip
                    ctx.translate(0, height);
                    ctx.scale(1, -1);
                    break;
                case 5:
                    // vertical flip + 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.scale(1, -1);
                    break;
                case 6:
                    // 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(0, -height);
                    break;
                case 7:
                    // horizontal flip + 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(width, -height);
                    ctx.scale(-1, 1);
                    break;
                case 8:
                    // 90 rotate left
                    ctx.rotate(-0.5 * Math.PI);
                    ctx.translate(-width, 0);
                    break;
                default:
                    break;
            }
        }

        /**
         * Upload image data to server.
         *
         * @param blob Image as blob
         */
        function realUploadImage(blob) {
            // Start upload.
            var xmlHttpRequest = new XMLHttpRequest();

            // Send image as binary file using HTTP PUT.
            xmlHttpRequest.open("PUT", settings.postUrl, true /* async */);
            var requestTimer = setTimeout(function () {

                // Timeout uploading.
                xmlHttpRequest.abort();
                settings.onUploaded && settings.onUploaded(false);

            }, MAXIMUM_WAITING_TIME);

            // Send progress notifications, 0...100%.
            xmlHttpRequest.upload.onprogress = function (evt) {
                if (evt.lengthComputable && settings.onUploadProgress) {
                    var percentComplete = Math.round((evt.loaded / evt.total) * 100);
                    settings.onUploadProgress(percentComplete);
                }
            };

            // On error or success notifications.
            xmlHttpRequest.onreadystatechange = function () {
                // in case of network errors this might not give reliable results
                if (this.readyState == this.DONE) {

                    // Cancel timeout.
                    clearTimeout(requestTimer);

                    if (settings.onUploaded) {
                        var success = (xmlHttpRequest.status == 200);
                        settings.onUploaded(success, this.responseText)
                    }
                }
            };

            // Start daadwerkelijke versturen.
            xmlHttpRequest.send(blob);
        }

        /**
         * Parse JPEG EXIF data, store EXIF orientation in 'data' property.
         *
         * @param dataUrl string Binary Image data
         * @param img HTMLImageElement Image
         */
        function parseJpegExifOrientation(dataUrl, img) {
            try {
                var byteString = atob(dataUrl.split(',')[1]);
                var binaryFile = new EXIF.BinaryFile(byteString, 0, byteString.length);
                var exif = EXIF.findEXIFinJPEG(binaryFile);

                // Store EXIF orientation (if available) in data property.
                if (exif && exif['Orientation']) {
                    $(img).data('orientation', exif['Orientation']);
                }
            } catch (e) {
                // Error parsing EXIF data.
                window.console && console.log('Error loading EXIF data', e);
            }
        }

        /**
         * Convert File to image object.
         *
         * @param callback Callback to call when image successfully loaded
         * @param file File object from file drop or <input type=file>
         * @return boolean True if type is image, false otherwise
         */
        function createImageFromFile(callback, file) {

            // Make sure these files are actually images:
            var isImage = file.type == 'image/jpeg' || file.type == 'image/png' || file.type == 'image/gif';
            if (!isImage) {
                // Not of expected type.
                return false
            }

            var img = document.createElement("img");
            $(img).data('fileType', file.type);

            if (window.FileReader) {
                var reader = new FileReader();
                reader.onload = (function (pImg) {
                    return function (e) {
                        var dataUrl = e.target.result;
                        pImg.onload = callback;
                        pImg.src = dataUrl;

                        if (file.type == 'image/jpeg') {
                            parseJpegExifOrientation(dataUrl, pImg);
                        }
                    };
                })(img);
                reader.readAsDataURL(file);

            } else {
                window.URL = window.URL || window.webkitURL || false;
                var imageUrl = URL.createObjectURL(file);
                img.onload = callback;
                img.src = imageUrl;
            }
            // Success.
            return true;
        }

        /**
         * Convert File to image object.
         *
         * @param callback Callback to call when image successfully loaded
         * @param imageUrl Data URL or "real" URL
         * @return boolean True if type is image, false otherwise
         */
        function createImageFromUrl(callback, imageUrl) {
            //  Reference File object by URL from HTML.
            // (img.onload() continues after finished loading)
            var img = document.createElement("img");
            img.onload = callback;
            img.src = imageUrl;

            return true;
        }

        /**
         * Determine max width and height of image.
         *
         * @param maxLength Max length
         * @param width Originele breedte
         * @param height Originele hoogte
         * @return object width en height
         */
        function determineScaleWidthAndHeight(maxLength, width, height) {

            if (width > height) {
                if (width > maxLength) {
                    height *= maxLength / width;
                    width = maxLength;
                }
            } else {
                if (height > maxLength) {
                    width *= maxLength / height;
                    height = maxLength;
                }
            }
            return {width: Math.round(width), height: Math.round(height)};
        }

        /**
         * Determine max width and height based on fixed x/y ratio.
         *
         * @param ratio X / Y
         * @param width Original width
         * @param height Original height
         * @return object new width and height (input for cropping)
         */
        function determineCropWidthAndHeight(ratio, width, height) {

            var currentRatio = width / height;
            if (currentRatio != ratio) {
                if (currentRatio > ratio) {
                    // Cut x
                    width = height * ratio;
                } else {
                    // Cut y
                    height = width / ratio;
                }
            }

            return {width: Math.round(width), height: Math.round(height)};
        }

        /**
         * Convert canvas contents to Blob object.
         *
         * @param canvas Canvas element
         * @return Blob object ( https://developer.mozilla.org/en-US/docs/DOM/Blob )
         */
        function convertCanvasToBlob(canvas) {
            if (canvas.mozGetAsFile) {
                // Mozilla implementation (File extends Blob).
                return canvas.mozGetAsFile(null, 'image/jpeg', '0.9');
            } else if (canvas.toBlob) {
                // HTML5 implementation.
                // https://developer.mozilla.org/en/DOM/HTMLCanvasElement
                return canvas.toBlob(null, 'image/jpeg', '0.9');
            } else {
                // WebKit implementation.
                // http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
                return createBlobFromDataUri(canvas.toDataURL('image/jpeg', '0.9'));
            }
        }

        /**
         * Convert WebKit dataURI to Blob.
         */
        function createBlobFromDataUri(dataURI) {

            // Convert base64/URLEncoded data component to raw binary data held in a string
            var splitString = dataURI.split(',');
            var splitStringMime = splitString[0];
            var splitStringData = splitString[1];

            var byteString;
            if (splitStringMime.indexOf('base64') >= 0) {
                byteString = atob(splitStringData);
            } else {
                byteString = decodeURIComponent(splitStringData);
            }

            // separate out the mime component
            var mimeString = splitStringMime.split(':')[1].split(';')[0];

            // Write the bytes of the string to an ArrayBuffer
            var length = byteString.length;
            var buf = new ArrayBuffer(length);
            var view = new Uint8Array(buf);
            for (var i = 0; i < length; i++) {
                view[i] = byteString.charCodeAt(i);
            }

            // Detect if Blob object is supported.
            if (typeof Blob !== 'undefined') {
                return new Blob([buf], {type: mimeString});

            } else {
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
                var bb = new BlobBuilder();
                bb.append(buf);
                return bb.getBlob(mimeString);
            }
        }

        // Return settings object to allow modifications @runtime.
        return settings;
    };

})(jQuery);


