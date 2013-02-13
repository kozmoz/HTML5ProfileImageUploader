<!DOCTYPE html>

<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta charset="utf-8"/>

    <title>HTML5 photo upload</title>

    <link href="css/bootstrap-2.3.min.css" rel="stylesheet" type="text/css"/>
    <link href="css/style.css" rel="stylesheet" type="text/css"/>

</head>
<body>

<div class="container">
    <section id="global">
        <div class="page-header">
            <h1>HTML5 photo upload</h1>
        </div>
        <div class="row">
            <div class="span12">

                <p class="lead">
                    Drag 'n drop your photo (and leave the technical details to us)
                </p>

                <p>
                    HTML5 photo upload is a jQuery plugin to crop, scale and upload an image. It croppes the dropped or selected image at the predefined
                    resolution and scales it down to fit automatically. For efficiency, cropping and scaling is performed on the browser side. The
                    resulting image is uploaded to the server through an asynchronous call. This plugin exploits all of HTML5's
                    possibilities, available in every modern browser.
                </p>

                <p>
                    <a href="http://blog.avisi.nl/2013/02/13/html5-drag-n-drop-photo/" target="_blank">http://blog.avisi.nl/2013/02/13/html5-drag-n-drop-photo/</a>
                </p>

                <h3>Live Demo</h3>

                <p>Files are automatically uploaded as soon as they are added, no files are stored on the server.</p>

                <form>
                    <fieldset>
                        <label>Target image size in pixels</label>
                        <label class="radio">
                            <input type="radio" name="targetsize" value="800,600" checked="checked"> 800 x 600
                        </label>
                        <label class="radio">
                            <input type="radio" name="targetsize" value="800,800"> 800 x 800
                        </label>
                        <label class="radio">
                            <input type="radio" name="targetsize" value="600,800"> 600 x 800
                        </label>
                    </fieldset>
                </form>

                <!-- Drop media element. -->
                <div class="media-drop">

                    <!-- Image placeholder. -->
                    <div id="droppedimage"></div>

                    <div id="dropbox" class="media-drop-placeholder" style="width: 640px; height: 480px">
                        <span class="media-drop-placeholder-title">Drop image here</span>
                        <span class="media-drop-placeholder-or">or</span>

                        <div class="media-drop-placeholder-uploadbutton">
                            <?php /* Put hidden input[type=file] above ordinary button.*/ ?>
                            <input id="realUploadBtn" name="media-drop-placeholder-file" type="file" accept="image/*" tabindex="-1"/>
                            <button id="uploadBtn" type="button" class="btn" tabindex="-1">Browse file&hellip;</button>
                        </div>
                    </div>
                </div>
                <!-- Error message placeholder. -->
                <p class="help-block error errormessages"></p>

                <button id="resetupload" type="button" class="btn">Upload new image</button>
            </div>
        </div>
        <!-- /.row -->
    </section>
</div>

<footer class="footer">
    <div class="container">
        <p>Built with all the love in the world.</p>
    </div>
</footer>

<script src="js/jquery-1.9.0.min.js"></script>
<script src="js/jquery.html5uploader-1.1.js"></script>
<script src="js/exif.js"></script>
<script src="js/main.js"></script>

</body>
</html>
