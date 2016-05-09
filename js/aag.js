/* Generates a savable album art styled image based on a user
 * upload photo.
 * Leveraging mostly canvas. 
 *
 * @author Katie Sexton github.com/ksex
 */ 

var albumArtGenerator = {
 
    /* Dom elements
     */
    canvas: document.getElementById('main-canvas'),
    imageLoader: document.getElementById('imageUpload'),
    ctx: document.getElementById('main-canvas').getContext('2d'),

    textFields: {
      albumTitle: document.getElementById('albumTitle'),
      albumArtist: document.getElementById('albumArtist'), 
      albumSubtitle: document.getElementById('albumSubtitle'),
      sideA: document.getElementById('sideA'),
      sideB: document.getElementById('sideB')
    },
    albumInfoSubmit: document.getElementById('submit-text'),

    palette: document.getElementById('palette-options'),

    selectedColor: null,
    colorScheme: null,


    /* Default settings
     */
    canvasDefaults: {
        size: 725,
        width: 725,
        height: 725
    },
    fontDefaults: {textAlign: "end", maxWidth: 455},
    fontSettings: {
      albumArtist: {font: "bold 52px Libre Baskerville", offset1: "685", offset2: "60"},
      albumSubtitle: {font: "400 18px Libre Baskerville", offset1: "685", offset2: "90"},
      albumTitle:  {font: "200 italic 36px Libre Baskerville", offset1: "685", offset2: "140"},
      trackListing: {font: "400 18px Libre Baskerville", offset1: "685", offset2: "160", offset3: "180", offset4: "200", offset5: "220"}
    },

    init: function() {

        /* Event Listeners
         */
        this.albumInfoSubmit.addEventListener("click", this.getSubmittedText, false);
        this.imageLoader.addEventListener('change', this.handleImage, false);
        this.palette.addEventListener('click', this.changeDefaultColor, false);

        this.setUpCanvas();
        self = this;
    }, 

    setUpCanvas: function() {
        this.canvas.width = this.canvasDefaults.width;
        this.canvas.height = this.canvasDefaults.height;    
    },

    getSubmittedText: function(e) {
        /* Draws text on click of "submit"
         * element
         */ 
         var sideA;
         var sideB;
         _.each(self.textFields, function(field) {
          if (!_.isEmpty(field.value)){
            if (field.name !== 'sideA' && field.name !== 'sideB') {
              self.drawText(field.value, self.fontSettings[field.name]);  
            } else {
              if (field.name == 'sideA') { sideA = field.value; }
              if (field.name == 'sideB') { sideB = field.value; }
            }                      
          }
        });

        if (!_.isEmpty(sideA) || !_.isEmpty(sideB)) {
          self.drawTrackListing(sideA, sideB, self.fontSettings.trackListing);
        }
    },

    handleImage: function(e) {
        /* This function reads the image,
         * generates the color palettes
         * and draws it into the canvas.
         * @TODO: not a very nice function
         */
        var fr = new FileReader();
        fr.onload = function(event){
                var img = new Image();
                img.onload = function(){
                        newSize = self.computeNewSize(img);
                        var colorThief = new ColorThief();
                        colorScheme = colorThief.getPalette(img, 6);
                        self.drawPaletteOptions(colorScheme);    
                        self.ctx.drawImage(
                                img, 
                                self.canvasDefaults.width / 2 - newSize.width / 2,
                                self.canvasDefaults.height / 2 - newSize.height / 2, 
                                newSize.width, 
                                newSize.height
                        );
                }
                img.src = event.target.result;
        }
        fr.readAsDataURL(e.target.files[0]); 
    }, 

    changeDefaultColor: function(e) {
        if (e.target && e.target.matches("a.option")) {
            color = e.target.style.backgroundColor;
            self.selectedColor = color;
        } 
    },

    drawPaletteOptions: function(colorScheme) {
        markup = '';
        _.each(colorScheme, function(scheme){
                markup += '<a class="option" style="background-color: rgb(' + scheme[0] + ', ' + scheme[1] + ',' + scheme[2] + ');"></a>';
        });
        self.palette.innerHTML = markup;    
    },

    computeNewSize: function(img) {
        /* Resizes the image to fit into
        * the canvas without having empty
        * space
        * @returns obj newsize newWidth newHeight
        */
        var imgRatio = img.height / img.width;
        var newSize = {};
        var newWidth;
        var newHeight;
        var maxSize = self.canvasDefaults.width;

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
    }, 

    getRgbString: function() {
        var rgb;
        if (self.colorScheme) {
        rgb = "rgb(" + self.colorScheme[1][0] + "," 
                     + self.colorScheme[1][1] + "," 
                     + self.colorScheme[1][2] + 
                ")";
        } else {
            rgb = "rgb(0, 0, 0)";
        }
        return rgb;
    },

    drawText: function(textInput, typeSettings) {
        /* Draws the text after computing the width.
        * Resets offsets for text to come later.
        */
        self.ctx.font = typeSettings.font;
        self.ctx.textAlign = self.fontDefaults.textAlign;
        self.ctx.fillStyle = self.selectedColor || self.getRgbString();
        //testWidth = determineLineBreaks(textInput, typeSettings);
        self.ctx.fillText(textInput, typeSettings.offset1, typeSettings.offset2);    

    },

    drawTrackListing: function(sideA, sideB, typeSettings) {
        /* Draws the track listings after
        * splitting each set into two
        * mostly even lines
        */ 

        self.ctx.font = typeSettings.font;
        self.ctx.textAlign = self.fontDefaults.textAlign;
        self.ctx.fillStyle = self.selectedColor || self.getRgbString();

        if (!_.isEmpty(sideA)) {
          sideAStrings = self.splitStrings(sideA);
          sideALine1 = 'Side A: ' + sideAStrings.stringOne;
          sideALine2 = sideAStrings.stringTwo;
          self.ctx.fillText(sideALine1, typeSettings.offset1, typeSettings.offset2);     
          self.ctx.fillText(sideALine2, typeSettings.offset1, typeSettings.offset3);  
        }

        if (!_.isEmpty(sideB)) {
          sideBStrings = self.splitStrings(sideB);

          sideBLine1 = 'Side B: ' + sideBStrings.stringOne;
          sideBLine2 = sideBStrings.stringTwo;

          self.ctx.fillText(sideBLine1, typeSettings.offset1, typeSettings.offset4);     
          self.ctx.fillText(sideBLine2, typeSettings.offset1, typeSettings.offset5);  
        }
 
    },

    splitStrings: function(stringToSplit) {
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
 
};

albumArtGenerator.init();
