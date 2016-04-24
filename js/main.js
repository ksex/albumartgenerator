var AAG = (function() {
    var imageLoader = document.getElementById('imageUpload');
    var canvas = document.getElementById('main-canvas');
    var ctx = canvas.getContext('2d');

    var albumTitle = document.getElementById('albumTitle');
    var albumArtist = document.getElementById('albumArtist');
    var albumSubtitle = document.getElementById('albumSubtitle');
    var albumInfoSubmit = document.getElementById('submit-text');

    var colorScheme;
    var contrastColor;

    albumInfoSubmit.addEventListener("click", getSubmittedText, false);
    imageLoader.addEventListener('change', handleImage, false);

    function handleImage(e){
        var reader = new FileReader();
        reader.onload = function(event){
            var img = new Image();
            img.onload = function(){
                newSize = computeNewSize(img);
                var colorThief = new ColorThief();
                colorScheme = colorThief.getPalette(img, 3);
                canvas.width = 725;
                canvas.height = 725;
                ctx.drawImage(img, 0, 0, newSize.width, newSize.height);
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);     
    }

    function computeNewSize(img){
        var imgRatio = img.height / img.width;
        var newSize = {};
        var newWidth;
        var newHeight;

        if (img.width > img.height) {
            //ensure that wide image has enough height to fill 
            newHeight = 725; 
            newWidth = (img.width * 725) / img.height;

        } else if (img.width < img.height) {
            newWidth = 725;
            newHeight = (img.height * 725) / img.width;
        } else {
            //perfect square
            newWidth = 725;
            newHeight = 725;
        }
        newSize.width = newWidth;
        newSize.height = newHeight;
        return newSize;

    }

    function getRgbString() {
        var rgb;
        rgb = "rgb(" + colorScheme[1][0] + ","+ colorScheme[1][1] +"," + colorScheme[1][2] + ")";
        console.log(rgb);
        return rgb;
    }

    function drawArtist(input){
        ctx.font = "bold 42px Libre Baskerville";
        ctx.textAlign = "end";
        ctx.fillStyle = getRgbString();
        ctx.fillText(input, 685, 60);
    }

    function drawSubtitle(input){
        ctx.font = "300 14px Libre Baskerville";
        ctx.textAlign = "end";
        ctx.fillStyle = getRgbString();
        ctx.fillText(input, 685, 90);   
    }

    function drawTitle(input) {
        ctx.font = "200 italic 32px Libre Baskerville";
        ctx.textAlign = "end";
        ctx.fillStyle = getRgbString();
        ctx.fillText(input, 685, 140);
    }

    function getSubmittedText(e) {
        e.preventDefault();
        drawTitle(albumTitle.value)
        drawArtist(albumArtist.value)
        drawSubtitle(albumSubtitle.value)

    }
})();



