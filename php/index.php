<!DOCTYPE html>

<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta charset="utf-8"/>

    <title>HTML5 Image Uploader</title>

    <link href="css/bootstrap-2.0.3.min.css" rel="stylesheet" type="text/css"/>
    <link href="css/style.css" rel="stylesheet" type="text/css"/>

</head>
<body>

<div class="container">
    <section id="global">
        <div class="page-header">
            <h1>HTML5 image uploader
                <small>scale image client side</small>
            </h1>
        </div>
        <div class="row">
            <div class="span12">
                <h2>Online Demo</h2>

                <!-- Drop media. -->
                <div class="media-drop thumbnail pull-left">
                    <div class="media-drop-placeholder">
                        <span class="media-drop-placeholder-title">Drop image here</span>
                        <span class="media-drop-placeholder-or">or</span>
                        <button class="btn btn-success">Browse files...
                            <!-- Verstop input[type=file] in een "gewone" button. -->
                            <input type="file"/>
                        </button>
                    </div>
                </div>

                <!-- Slider -->
                <div class="media-drop-slider" role="slider" aria-valuemax="100" aria-valuemin="0" aria-valuenow="14" aria-orientation="horizontal">
                    <img class="icon-small" src="img/slider-small.png" width="9" height="7" alt=""/>
                    <div class="track">
                        <div class="left"></div>
                        <div class="middle"></div>
                        <div class="right"></div>
                        <div class="sc-handle"></div>
                    </div>
                    <img class="icon-big" src="img/slider-big.png" width="16" height="12" alt=""/>
                </div>

            </div>
        </div>
        <!-- /.row -->
    </section>
</div>

<script src="js/jquery-1.7.2.min.js"></script>
<script src="js/jquery.html5uploader-1.0.js"></script>
<script src="js/main.js"></script>

<!-- Page rendered in 0.0557 seconds -->
</body>
</html>
