window.onload = function() {
    var largeurCanvas = 800;
    var hauteurCanvas = 500;
    var tailleBloc = 30;
    var ctx;
    var delai = 100;
    var serpent;
    var pomme;
    var largeurEnBlocs = largeurCanvas / tailleBloc;
    var hauteurEnBlocs = hauteurCanvas / tailleBloc;
    var score;
    var timeout;
    var jeuDemarre = false;

    function init() {
        var canvas = document.createElement('canvas');
        canvas.width = largeurCanvas;
        canvas.height = hauteurCanvas;
        canvas.style.border = "30px solid gray";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        document.body.appendChild(canvas);

        ctx = canvas.getContext('2d');
        dessinerMenu();
    }

    function dessinerMenu() {
        ctx.save();
        ctx.font = "bold 30px sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var centreX = largeurCanvas / 2;
        var centreY = hauteurCanvas / 2;
        ctx.fillText("Appuyez sur 'Espace' pour commencer", centreX, centreY);
        ctx.restore();
    }

    function rafraichirCanvas() {
        serpent.avancer();
        if (serpent.checkCollision()) {
            jeuFini();
        } else {
            if (serpent.mangePomme(pomme)) {
                score++;
                serpent.aMangePomme = true;
                do {
                    pomme.setNouvellePosition();
                } while (pomme.estSurSerpent(serpent));
            }
            ctx.clearRect(0, 0, largeurCanvas, hauteurCanvas);
            dessinerScore();
            serpent.dessiner();
            pomme.dessiner();
            timeout = setTimeout(rafraichirCanvas, delai);
        }
    }

    function jeuFini() {
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "White";
        ctx.lineWidth = 5;
        var centreX = largeurCanvas / 2;
        var centreY = hauteurCanvas / 2;
        ctx.strokeText("Game Over", centreX, centreY - 100);
        ctx.fillText("Game Over", centreX, centreY - 100);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyez sur 'Espace' pour rejouer", centreX, centreY);
        ctx.fillText("Appuyez sur 'Espace' pour rejouer", centreX, centreY);
        ctx.restore();
    }

    function recommencer() {
        serpent = new Serpent([[6, 4], [5, 4], [4, 4]], "droite");
        pomme = new Pomme([10, 10]);
        score = 0;
        clearTimeout(timeout);
        jeuDemarre = true;
        rafraichirCanvas();
    }

    function dessinerScore() {
        ctx.save();
        ctx.font = "bold 50px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var centreX = largeurCanvas / 2;
        var centreY = hauteurCanvas / 2 - 100;
        ctx.fillText("Score: " + score, centreX, centreY);
        ctx.restore();
    }

    function dessinerBloc(ctx, position) {
        var x = position[0] * tailleBloc;
        var y = position[1] * tailleBloc;
        ctx.fillRect(x, y, tailleBloc, tailleBloc);
    }

    function Serpent(corps, direction) {
        this.corps = corps;
        this.direction = direction;
        this.aMangePomme = false;

        this.dessiner = function() {
            ctx.save();
            ctx.fillStyle = "#0a77f5";
            for (var i = 0; i < this.corps.length; i++) {
                dessinerBloc(ctx, this.corps[i]);
            }
            ctx.restore();
        };

        this.avancer = function() {
            var prochainePosition = this.corps[0].slice();
            switch (this.direction) {
                case "gauche":
                    prochainePosition[0] -= 1;
                    break;
                case "droite":
                    prochainePosition[0] += 1;
                    break;
                case "bas":
                    prochainePosition[1] += 1;
                    break;
                case "haut":
                    prochainePosition[1] -= 1;
                    break;
                default:
                    throw new Error("Direction invalide");
            }
            this.corps.unshift(prochainePosition);
            if (!this.aMangePomme) {
                this.corps.pop();
            } else {
                this.aMangePomme = false;
            }
        };

        this.setDirection = function(nouvelleDirection) {
            var directionsAutorisees;
            switch (this.direction) {
                case "gauche":
                case "droite":
                    directionsAutorisees = ["haut", "bas"];
                    break;
                case "bas":
                case "haut":
                    directionsAutorisees = ["gauche", "droite"];
                    break;
                default:
                    throw new Error("Direction invalide");
            }
            if (directionsAutorisees.indexOf(nouvelleDirection) > -1) {
                this.direction = nouvelleDirection;
            }
        };

        this.checkCollision = function() {
            var collisionMur = false;
            var collisionSerpent = false;
            var tete = this.corps[0];
            var reste = this.corps.slice(1);
            var serpentX = tete[0];
            var serpentY = tete[1];
            var minX = 0;
            var minY = 0;
            var maxX = largeurEnBlocs - 1;
            var maxY = hauteurEnBlocs - 1;
            var pasEntreMursHorizontaux = serpentX < minX || serpentX >= largeurEnBlocs;
            var pasEntreMursVerticaux = serpentY < minY || serpentY >= hauteurEnBlocs;

            if (pasEntreMursHorizontaux || pasEntreMursVerticaux) {
                collisionMur = true;
            }
            for (var i = 0; i < reste.length; i++) {
                if (serpentX === reste[i][0] && serpentY === reste[i][1]) {
                    collisionSerpent = true;
                }
            }
            return collisionMur || collisionSerpent;
        };

        this.mangePomme = function(pommeAManger) {
            var tete = this.corps[0];
            return tete[0] === pommeAManger.position[0] && tete[1] === pommeAManger.position[1];
        };
    }

    function Pomme(position) {
        this.position = position;

        this.dessiner = function() {
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            var rayon = tailleBloc / 2;
            var x = this.position[0] * tailleBloc + rayon;
            var y = this.position[1] * tailleBloc + rayon;
            ctx.arc(x, y, rayon, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.restore();
        };

        this.setNouvellePosition = function() {
            var nouvelleX = Math.round(Math.random() * (largeurEnBlocs - 1));
            var nouvelleY = Math.round(Math.random() * (hauteurEnBlocs - 1));
            this.position = [nouvelleX, nouvelleY];
        };

        this.estSurSerpent = function(serpentAChecker) {
            for (var i = 0; i < serpentAChecker.corps.length; i++) {
                if (this.position[0] === serpentAChecker.corps[i][0] && this.position[1] === serpentAChecker.corps[i][1]) {
                    return true;
                }
            }
            return false;
        };
    }

    document.onkeydown = function(e) {
        var touche = e.keyCode;
        var nouvelleDirection;
        if (!jeuDemarre && touche === 32) { // Espace pour démarrer le jeu
            jeuDemarre = true;
            recommencer();
        } else if (jeuDemarre) {
            switch (touche) {
                case 37:
                    nouvelleDirection = "gauche";
                    break;
                case 38:
                    nouvelleDirection = "haut";
                    break;
                case 39:
                    nouvelleDirection = "droite";
                    break;
                case 40:
                    nouvelleDirection = "bas";
                    break;
                case 32: // Espace pour recommencer
                    recommencer();
                    return;
                default:
                    return;
            }
            serpent.setDirection(nouvelleDirection);
        }
    };

    // Initialiser le jeu lorsque la page est chargée
    init();
};
