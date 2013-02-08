<!DOCTYPE html>

<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta charset="utf-8"/>

    <title>HTML5 Image Uploader</title>

    <link href="css/bootstrap-2.3.min.css" rel="stylesheet" type="text/css"/>
    <link href="css/style.css" rel="stylesheet" type="text/css"/>

</head>
<body>

<div class="container">
    <section id="global">
        <div class="page-header">
            <h1>HTML5 image uploader
                <small>crop and scale image client side</small>
            </h1>
        </div>
        <div class="row">
            <div class="span12">

                <p>
                    jQuery plugin to crop, scale and upload an image. It croppes the image at the predefined perspective and scales it down to fit best automatically. For efficientness, cropping and scaling is performed client side at the browser. The resulting image is uploaded to the server through an asynchronous call. It exploits all of HTML5's possibilities, available in
                    every modern browser.
                </p>

                <p>
                    <a href="http://www.juurlink.org/todo/">http://www.juurlink.org/todo/</a>
                </p>

                <h2>Online Demo</h2>

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

                <div class="photo-placeholder">

                    <!-- Image placeholder. -->
                    <div id="droppedimage"></div>

                    <!-- Drop media. -->
                    <div class="media-drop">
                        <div class="media-drop-placeholder">
                            <span class="media-drop-placeholder-title">Drop image here</span>
                            <span class="media-drop-placeholder-or">or</span>

                            <div class="media-drop-placeholder-uploadbutton">
                                <?php /* Verstop input[type=file] in een "gewone" button.*/ ?>
                                <input id="realUploadBtn" name="media-drop-placeholder-file" type="file" accept="image/*" tabindex="-1"/>
                                <button id="uploadBtn" type="button" class="btn" tabindex="-1">Browse file&hellip;</button>
                            </div>
                        </div>
                    </div>
                    <!-- Error message placeholder. -->
                    <p class="help-block error errormessages"></p>
                </div>

            </div>
        </div>
        <!-- /.row -->
    </section>
</div>

<script src="js/jquery-1.9.0.min.js"></script>
<script src="js/jquery.html5uploader-1.1.js"></script>
<script src="js/exif.js"></script>
<script src="js/main.js"></script>

</body>
</html>
