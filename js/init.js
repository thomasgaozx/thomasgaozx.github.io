// tagging specific elements
$(document).ready(function() {
    // wrap everything in bootstrap container
    var str = document.body.innerHTML
    document.body.innerHTML = "<div class=\"container\"></div>"
    document.querySelector("body div.container").innerHTML = str

    // make table look better
    document.querySelectorAll("table").forEach(function(e) { e.classList += "table table-sm table-bordered col-md-9" })
    document.querySelectorAll("img").forEach(function(e) { e.classList.add("img-fluid"); e.classList.add("img-thumbnail"); })
})

// prepare libraries
var libs = String.raw`
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js" integrity="sha384-wHAiFfRlMFy6i5SRaxvfOCifBUQy1xHdJ/yoi7FRNXMRBu5WHdZYu1hA6ZOblgut" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js" integrity="sha384-B0UglyR+jN6CkvvICOB2joaf5I4l3gm9GU6Hc1og6Ls7i6U/mkkaduKaBhlAXv9k" crossorigin="anonymous"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.10.2/dist/katex.min.css" integrity="sha384-yFRtMMDnQtDRO8rLpMIKrtPCD5jdktao2TV19YiZYWMDkUR5GQZR/NOVTdquEx1j" crossorigin="anonymous">
<link href="https://cdn.jsdelivr.net/npm/katex-copytex@latest/dist/katex-copytex.min.css" rel="stylesheet" type="text/css">
<script src="https://cdn.jsdelivr.net/npm/katex-copytex@latest/dist/katex-copytex.min.js"></script>`;

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
#myBtn {
    display: none;
    position: fixed;
    bottom: 20px;
    right: 30px;
    z-index: 99;
    font-size: 18px;
    border: none;
    outline: none;
    background-color: brown;
    color: white;
    cursor: pointer;
    padding: 15px;
    border-radius: 4px;
}

#myBtn:hover {
    background-color: #555;
}
`;

var scroll_to_top = document.createElement('button')
scroll_to_top.setAttribute("id", "myBtn")
scroll_to_top.setAttribute("onclick", "topFunction()")
scroll_to_top.setAttribute("title", "Go to top")
scroll_to_top.innerText = "Back To Top"

document.getElementsByTagName('head')[0].appendChild(custom_style);
document.getElementsByTagName('body')[0].appendChild(scroll_to_top);

// From https://www.w3schools.com/howto/howto_js_scroll_to_top.asp
var mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}