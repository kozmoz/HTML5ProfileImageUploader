/*!
 * jQuery HTML5 Uploader 1.0b
 *
 * https://github.com/kozmoz/HTML5ProfileImageUploader
 *
 * Based on:
 * - http://www.igloolab.com/jquery-html5-uploader
 * - http://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
 */
(function ($) {
    $.fn.html5Uploader = function (options) {
        var settings = {
            "name":"uploadedFile",
            "postUrl":"upload",
            "onDrop":null,
            "onProcessed":null,
            "onServerAbort":null,
            "onServerError":null,
            "onServerLoad":null,
            "onServerLoadStart":null,
            "onServerProgress":null,
            "onServerReadyStateChange":null,
            "cropRatio":1.11,
            "maxlength":2048};
        if (options) {
            $.extend(settings, options);
        }

        // Add the dataTransfer property for use with the native `drop` event to capture information about files dropped into the browser window.
        jQuery.event.props.push("dataTransfer");

        var originalSelector = this.selector;
        return this.each(function (options) {
            var $this = $(this);
            if ($this.is("[type='file']")) {
                $this.bind("change", function () {
                    // Max 1 file.
                    var files = this.files;
                    if (files.length > 0) {
                        fileHandler(files[0]);
                    }
                });
            } else {

                // The ondragover event needs to be canceled in Google Chrome and Safari to allow firing the ondrop event.
                // Cancel drop events on body.

                // Toggle dragover class.
                var hasDragoverClass = false;
                $(document).on("dragover", '*', function (e) {
                    if (hasDragoverClass) {
                        $this.removeClass("dragover");
                        hasDragoverClass = false;
                    }
                    return false;
                });
                // Zet "dragover" class op drop area.
                $('body').on("dragover", originalSelector, function (e) {
                    if (!hasDragoverClass) {
                        $this.toggleClass("dragover", true);
                        hasDragoverClass = true;
                    }
                    return false;
                });

                // Catch file drop.
                $this.bind("drop", function (e) {
                    // Max 1 file.
                    var files = e.dataTransfer.files;
                    if (files.length > 0) {
                        fileHandler(files[0]);
                    }

                    $this.removeClass("dragover");
                    return false;
                });
            }
        });

        /**
         * Handle upload of single file.
         *
         * @param droppedFile File object
         */
        function fileHandler(droppedFile) {

            window.console && console.info("jquery.html5uploader.js: File dropped: ", droppedFile);

            // Notify listener.
            if (settings.onDrop) {
                settings.onDrop();
            }

            // Make sure these files are actually images:
            var isImage = droppedFile.type == 'image/jpeg' || droppedFile.type == 'image/png' || droppedFile.type == 'image/gif';

            // Abort if not an image.
            if (!isImage) {
                window.console && console.info("jquery.html5uploader.js: Break, file is geen image: ", droppedFile.type);

                if (settings.onProcessed) {
                    settings.onProcessed(droppedFile, false);
                }
                return
            }

            // Resize image and crop.
            // Reference File object by URL from HTML.
            var originalFileName = droppedFile.name;
            var droppedImage = document.createElement("img");
            droppedImage.onload = function () {

                var droppedImageLoaded = this;
                var originalWidth = droppedImageLoaded.width;
                var originalHeight = droppedImageLoaded.height;

                // Calculate width and height based on ratio.
                var ret = determineCropWidthAndHight(settings.cropRatio, originalWidth, originalHeight);
                var cropWidth = ret.width;
                var cropHeight = ret.height;

                // Determine if longest side exceeds max length.
                ret = determineScaleWidthAndHight(settings.maxlength, cropWidth, cropHeight);
                var scaleWidth = ret.width;
                var scaleHeight = ret.height;

                var scaleRatio = cropWidth / scaleWidth;

                // Crop and scale.
                var canvas = document.createElement("canvas");
                canvas.width = scaleWidth;
                canvas.height = scaleHeight;
                var ctx = canvas.getContext("2d");
                var x = -1 * (Math.round(((originalWidth - cropWidth) / 2) / scaleRatio));
                var y = -1 * (Math.round(((originalHeight - cropHeight) / 2) / scaleRatio));
                x = Math.min(0, x);
                y = Math.min(0, y);
                var w = Math.round(originalWidth / scaleRatio);
                var h = Math.round(originalHeight / scaleRatio);

                ctx.drawImage(droppedImageLoaded, x, y, w, h);

                // Convert canvas to file.
                var file = false;
                if (canvas.toBlob) {
                    // HTML5 implementation.
                    // https://developer.mozilla.org/en/DOM/HTMLCanvasElement
                    file = canvas.toBlob(null, 'image/jpeg', '0.9');
                    file.name = originalFileName;
                } else if (canvas.mozGetAsFile) {
                    // Mozilla implementation.
                    file = canvas.mozGetAsFile(originalFileName, 'image/jpeg', '0.9');
                } else {
                    // Webkit implementation.
                    // http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
                    file = dataURItoBlob(canvas.toDataURL('image/jpeg', '0.9'));
                    file.name = originalFileName;
                }


                // Notify listeners of scaled and cropped image.
                if (settings.onProcessed) {
                    settings.onProcessed(file, isImage);
                }


                // Start upload.
                var xmlHttpRequest = new XMLHttpRequest();
                xmlHttpRequest.upload.onabort = function (e) {
                    if (settings.onServerAbort) {
                        settings.onServerAbort(e, file);
                    }
                };
                xmlHttpRequest.upload.onerror = function (e) {
                    if (settings.onServerError) {
                        settings.onServerError(e, file);
                    }
                };
                xmlHttpRequest.upload.onload = function (e) {
                    if (settings.onServerLoad) {
                        settings.onServerLoad(e, file, xmlHttpRequest.responseText);
                    }
                };
                xmlHttpRequest.upload.onloadstart = function (e) {
                    if (settings.onServerLoadStart) {
                        settings.onServerLoadStart(e, file);
                    }
                };
                xmlHttpRequest.upload.onprogress = function (e) {
                    if (settings.onServerProgress) {
                        settings.onServerProgress(e, file);
                    }
                };
                xmlHttpRequest.onreadystatechange = function () {
                    // in case of network errors this might not give reliable results
                    if (this.readyState == this.DONE) {
                        if (settings.onServerSuccess) {
                            console && console.info("this.responseText: ", this.responseText);
                            settings.onServerSuccess(this.responseText)
                        }
                    }
                };

                // Send image as binary file using HTTP PUT.
                xmlHttpRequest.open("PUT", settings.postUrl, true);
                xmlHttpRequest.send(file);
            };

            //  Reference File object by URL from HTML.
            // (img.onload() continues after finished loading)
            droppedImage.src = (window.URL || window.webkitURL).createObjectURL(droppedFile);
        }

        /**
         * Determine max width and height of image.
         *
         * @param width Originele breedte
         * @param height Originele hoogte
         * @return width en height
         */
        function determineScaleWidthAndHight(maxLength, width, height) {

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
            return {width:width, height:height};
        }

        /**
         * Determine max width and height based on fixed x/y ratio.
         *
         * @param width Original width
         * @param height Original height
         * @return new width and height (input for cropping)
         */
        function determineCropWidthAndHight(ratio, width, height) {

            var currentRatio = width / height;
            if (currentRatio != ratio) {
                if (currentRatio > ratio) {
                    // Cut x
                    width = Math.round(height * ratio);
                } else {
                    // Cut y
                    height = Math.round(width / ratio);
                }
            }

            return {width:width, height:height};
        }

        /**
         * Convert Webkit dataURI to Blob.
         */
        function dataURItoBlob(dataURI, callback) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0) {
                byteString = atob(dataURI.split(',')[1]);
            } else {
                byteString = unescape(dataURI.split(',')[1]);
            }

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            // write the ArrayBuffer to a blob, and you're done
            var bb = new (window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder)();
            bb.append(ab);
            return bb.getBlob(mimeString);
        }

    };
})(jQuery);


