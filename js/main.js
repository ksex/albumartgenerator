var AAG = (function() {

    /* Variables and dom
     * elements
     */
    var imageLoader = document.getElementById('imageUpload');
    var canvas = document.getElementById('main-canvas');
    var ctx = canvas.getContext('2d');

    var albumTitle = document.getElementById('albumTitle');
    var albumArtist = document.getElementById('albumArtist');
    var albumSubtitle = document.getElementById('albumSubtitle');
    var albumInfoSubmit = document.getElementById('submit-text');
    var palette = document.getElementById('palette-options');

    var colorScheme;
    var selectedColor;

    /* Settings objects
     */
    var canvasDefaults = {size: 725, width: 725, height: 725}
    var fontDefaults = {textAlign: "end", maxWidth: 455};
    var albumArtistSettings = {font: "bold 52px Libre Baskerville", offset1: "685", offset2: "60"}
    var albumSubtitleSettings = {font: "400 18px Libre Baskerville", offset1: "685", offset2: "90"}
    var albumTitleSettings = {font: "200 italic 36px Libre Baskerville", offset1: "685", offset2: "140"}
    var trackListingSettings = {font: "400 18px Libre Baskerville", offset1: "685", offset2: "160", offset3: "180", offset4: "200", offset5: "220"}

    /* Event Listeners
     */
    albumInfoSubmit.addEventListener("click", getSubmittedText, false);
    imageLoader.addEventListener('change', handleImage, false);
    palette.addEventListener('click', changeDefaultColor, false);

    setUpCanvas();

    function setUpCanvas(){
        canvas.width = canvasDefaults.width;
        canvas.height = canvasDefaults.height;
    }

    function handleImage(e){
        /* This function reads the image,
         * generates the color palettes
         * and draws it into the canvas.
         * @TODO: not a very nice function
         */
        var fr = new FileReader();
        fr.onload = function(event){
            var img = new Image();
            img.onload = function(){
                newSize = computeNewSize(img);
                var colorThief = new ColorThief();
                colorScheme = colorThief.getPalette(img, 6);
                drawPaletteOptions(colorScheme);  
                ctx.drawImage(
                    img, 
                    canvasDefaults.width / 2 - newSize.width / 2,
                    canvasDefaults.height / 2 - newSize.height / 2, 
                    newSize.width, 
                    newSize.height
                );
            }
            img.src = event.target.result;
        }
        fr.readAsDataURL(e.target.files[0]);  
    }

    function computeNewSize(img){
        /* Resizes the image to fit into
         * the canvas without having empty
         * space
         * @returns obj newsize newWidth newHeight
         */
        var imgRatio = img.height / img.width;
        var newSize = {};
        var newWidth;
        var newHeight;
        var maxSize = canvasDefaults.width;

        if (img.width > img.height) {
            //ensure that wide image has enough height to fill 
            newHeight = maxSize; 
            newWidth = (img.width * maxSize) / img.height;

        } else if (img.width < img.height) {
            newWidth = maxSize;
            newHeight = (img.height * maxSize) / img.width;
        } else {
            //perfect square
            newWidth = maxSize;
            newHeight = maxSize;
        }
        newSize.width = newWidth;
        newSize.height = newHeight;
        return newSize;
    }

    function drawPaletteOptions(colorScheme) {
        markup = '';
        _.each(colorScheme, function(scheme){
            markup += '<a class="option" style="background-color: rgb(' + scheme[0] + ', ' + scheme[1] + ',' + scheme[2] + ');"></a>';
        });
        palette.innerHTML = markup;  
    }

    function changeDefaultColor(e) {
        if (e.target && e.target.matches("a.option")) {
            color = e.target.style.backgroundColor;
            selectedColor = color;
        }
    }

    function getRgbString(arr) {
        var rgb;
        if (colorScheme) {
            rgb = "rgb(" + colorScheme[1][0] + "," 
                         + colorScheme[1][1] + "," 
                         + colorScheme[1][2] + 
                    ")";
        } else {
            rgb = "rgb(0, 0, 0)";
        }
        return rgb;
    }

    function drawText(textInput, typeSettings) {
        /* Draws the text after computing the width.
         * Resets offsets for text to come later.
         */
         ctx.font = typeSettings.font;
         ctx.textAlign = fontDefaults.textAlign;
         ctx.fillStyle = selectedColor || getRgbString();
         //testWidth = determineLineBreaks(textInput, typeSettings);
         ctx.fillText(textInput, typeSettings.offset1, typeSettings.offset2);   
    }

    function determineLineBreaks(textInput, typeSettings) {
        /* Figure out if we need line breaks.
         * Apparently this is really hard, @TODO later
         */
         textWidth = ctx.measureText(textInput);

         console.log(textWidth.width);
         if (textWidth.width > fontDefaults.maxWidth) {
            console.log('wider', textWidth);
            var words = textInput.split(' ');
            var testLine = '';
            var newLine = ''
            _.each(words, function(word, index){
                console.log(word, index);
                testLine += word + ' ';
                testLength = ctx.measureText(testLine);
                if (testLength.width <= fontDefaults.maxWidth) {
                    line = testLine;
                } else {
                    line = testLine.split(' ');
                    // bleck
                }
            });

            console.log('shorter line', line);
         }

    }

    function drawTrackListing(sideA, sideB, typeSettings) {
        /* Draws the track listings after
         * splitting each set into two
         * mostly even lines
         */ 
        sideAStrings = splitStrings(sideA);
        sideBStrings = splitStrings(sideB);

        sideALine1 = 'Side A: ' + sideAStrings.stringOne;
        sideALine2 = sideAStrings.stringTwo;

        sideBLine1 = 'Side B: ' + sideBStrings.stringOne;
        sideBLine2 = sideBStrings.stringTwo;

        ctx.font = typeSettings.font;
        ctx.textAlign = fontDefaults.textAlign;
        ctx.fillStyle = selectedColor || getRgbString();
        ctx.fillText(sideALine1, typeSettings.offset1, typeSettings.offset2);   
        ctx.fillText(sideALine2, typeSettings.offset1, typeSettings.offset3);   
        ctx.fillText(sideBLine1, typeSettings.offset1, typeSettings.offset4);   
        ctx.fillText(sideBLine2, typeSettings.offset1, typeSettings.offset5);   
    
    }

    function splitStrings(stringToSplit) {
        /* Just divides a string in half(ish)
         * @param str stringToSplit
         * @return object string1 string2
         */
         var newStrings = {}
         words = stringToSplit.split(' ');
         slicer = Math.ceil(words.length / 2);

         stringOneArray = words.slice(0, slicer);
         stringTwoArray = words.slice(slicer, words.length);

         newStrings.stringOne = stringOneArray.join(' ');
         newStrings.stringTwo = stringTwoArray.join(' ');
         return newStrings;

    }

    function getSubmittedText(e) {
        /* Draws text on click of "submit"
         * element
         */ 
        e.preventDefault();
        drawText(albumArtist.value, albumArtistSettings);
        drawText(albumSubtitle.value, albumSubtitleSettings);
        drawText(albumTitle.value, albumTitleSettings);
        drawTrackListing(sideA.value, sideB.value, trackListingSettings);
    }
})();



