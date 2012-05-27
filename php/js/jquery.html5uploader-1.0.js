/*!
 * jQuery HTML5 Uploader 1.0b
 *
 * http://www.igloolab.com/jquery-html5-uploader
 *
 * http://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
 */
(function ($) {
    $.fn.html5Uploader = function (options) {
        var crlf = '\r\n';
        var boundary = "recipyrecipy";
        var dashes = "--";
        var settings = {
            "name":"uploadedFile",
            "postUrl":"upload",
            "onDrop":null,
            "onServerAbort":null,
            "onServerError":null,
            "onServerLoad":null,
            "onServerLoadStart":null,
            "onServerProgress":null,
            "onServerReadyStateChange":null};
        if (options) {
            $.extend(settings, options);
        }

        window.console && console.info('jquery.html5uploader.js: init()');

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

                //  The ondragover event needs to be canceled in Google Chrome and Safari to allow firing the ondrop event.

                // Cancel drop events op de body.
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
                        $this.addClass("dragover");
                        hasDragoverClass = true;
                    }
                    return false;
                });

                // Drop van file afvangen.
                $this.bind("drop", function (e) {
                    // Max 1 file.
                    var files = e.dataTransfer.files;
                    if (files.length > 0) {
                        fileHandler(files[0]);
                    }
                    return false;
                });
            }
        });

        // Handle upload van een enkele file.
        function fileHandler(file) {

            window.console && console.info("jquery.html5uploader.js: File dropped: ", file);

            // Make sure these files are actually images:
            var isImage = file.type == 'image/jpeg' || file.type == 'image/png' || file.type == 'image/gif';

            if (settings.onDrop) {
                settings.onDrop(file, isImage);
            }

            // Afbreken als geen image.
            if (!isImage) {
                window.console && console.info("jquery.html5uploader.js: Break, file is geen image: ", file.type);
                return
            }


            // Resize image.
            //  Reference File object by URL from HTML.
            var originalFileName = file.name;
            var img = document.createElement("img");
            img.onload = function () {

                var img = this;
                var ret = determineWidthAndHight2(img.width, img.height);

                window.console && console.info("Nieuwe afmetingen image: " + ret.width + ", " + ret.height);

                var canvas = document.createElement("canvas");
                canvas.width = ret.width;
                canvas.height = ret.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, ret.width, ret.height);

                // Canvas omzetten naar een File
                var file = false;
                if (canvas.mozGetAsFile) {
                    file = canvas.mozGetAsFile(originalFileName, 'image/png');
                } else {
                    // Webkit versie
                    // http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
                    file = dataURItoBlob(canvas.toDataURL('image/png'));
                    file.name = originalFileName;
                }

                window.console && console.info("jquery.html5uploader.js: Resized file: ", file);


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
                        console.info("response1", xmlHttpRequest.responseText);
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

                // Todo: Alleen binary verzenden blijven gebruiken?
                xmlHttpRequest.open("PUT", settings.postUrl, true);
                if (file.getAsBinary) {

                    window.console && console.info('file.getAsBinary');
                    var data = dashes + boundary + crlf +
                            "Content-Disposition: form-data;" +
                            "name=\"" + settings.name + "\";" +
                            "filename=\"" + unescape(encodeURIComponent(file.name)) + "\"" + crlf +
                            "Content-Type: application/octet-stream" + crlf + crlf +
                            file.getAsBinary() + crlf +
                            dashes + boundary + dashes;
                    xmlHttpRequest.setRequestHeader("Content-Type", "multipart/form-data;boundary=" + boundary);
                    xmlHttpRequest.sendAsBinary(data);

                } else if (false && window.FormData) {

                    window.console && console.info('formdata');
                    var formData = new FormData();
                    formData.append(settings.name, file);
                    xmlHttpRequest.send(formData);

                } else {

                    window.console && console.info('binary');
                    xmlHttpRequest.send(file);
//                    console.info("response sync: ", xmlHttpRequest.responseText);
                }


            };

            //  Reference File object by URL from HTML.
            img.src = (window.URL || window.webkitURL).createObjectURL(file);
        }
    };
})(jQuery);


/**
 * Bepaal max breedte ne hoogte van image.
 *
 * @param width Originele breedte
 * @param height Originele hoogte
 * @return width en height
 */
function determineWidthAndHight2(width, height) {

    var MAX_WIDTH = 1024;
    var MAX_HEIGHT = 1024;


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


function dataURItoBlob(dataURI, callback) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataURI.split(',')[1]);
    } else {
        byteString = unescape(dataURI.split(',')[1]);
    }

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

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
