// tagging specific elements
$(document).ready(function() {
    // wrap everything in bootstrap container
    var str = document.body.innerHTML
    document.body.innerHTML = "<div class=\"container\"></div>"
    document.querySelector("body div.container").innerHTML = str

    // make table look better
    document.querySelectorAll("table").forEach(function(e) { e.classList += "table table-sm table-bordered col-md-8" })
    document.querySelectorAll("img").forEach(function(e) { e.classList.add("img-fluid"); e.classList.add("img-thumbnail"); })
})

// prepare libraries
var libs = String.raw`
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.0/dist/katex.min.css" integrity="sha384-9eLZqc9ds8eNjO3TmqPeYcDj8n+Qfa4nuSiGYa6DjLNcv9BtN69ZIulL9+8CqC9Y" crossorigin="anonymous">
<link href="https://cdn.jsdelivr.net/npm/katex-copytex@latest/dist/katex-copytex.min.css" rel="stylesheet" type="text/css">
<script src="https://cdn.jsdelivr.net/npm/katex-copytex@latest/dist/katex-copytex.min.js"></script>
`;

// load libraries
$('head').append(libs)

// additional css
var custom_style = document.createElement('style');
custom_style.innerHTML = String.raw`
@import url(https://fonts.googleapis.com/css?family=Open+Sans:400);
blockquote{
    font-size: 1em;
    margin:10px auto;
    font-family:Open Sans;
    color: #555555;
    padding:.5em 15px .5em 15px;
    border-left:8px solid #78C0A8 ;
    line-height:1.6;
    position: relative;
    background:#EDEDED;
}
`;
document.getElementsByTagName('head')[0].appendChild(custom_style);
