/////////////////////////////////////////////////
// Declaration des variables et des paramètres //
/////////////////////////////////////////////////

const N = 768;	                    // nb total d'étoiles
const Rmin = 0;	                    // rayon de base des étoiles en pixels ("au loin")
const Rmax = 4;                     // rayon final des étoiles ("au près")
const dt = 0.04;	                // pas de temps en seconde
var run = false;	                // booléen qui gère l'état on/off de l'animation
var warp = false;                   // booléen qui gère l'état on/off du warpDrive
var rotate = false;                 // booléen qui gère l'effet de rotation
var thetaPoint = .2;                // vitesse angulaire de la rotation
var theta = thetaPoint * dt;        // incrément angulaire à chaque pas de temps
var cosTheta = Math.cos(theta);
var sinTheta = Math.sin(theta);
const z0 = 2000;                    // distance d'affichage "au loin", du plan d'apparition des étoiles
const d = 50;                       // distance entre l'observateur et "l'écran de projection"
var X = [];		                    // vecteur des positions selon X multiplié par d
var Y = [];		                    // vecteur des positions selon Y multiplié par d
var Z = [];                         // vecteur des positions selon Z multiplié par d
const Vmin = 100;                   // vitesse minimum des étoiles selon l'axe Z
const Vmax = 4000;                  // vitesse maximum (warpDrive on) des étoiles selon l'axe Z
var v = Vmin;                       // vitesse des étoiles selon Z
const Acc = 200;                    // accélération pendant les phases de transition
// const W = 1280;	                    // largeur du domaine en pixels ("écran de projection")
// const H = 720;	                    // hauteur du domaine en pixels
var mainDiv = document.getElementsByTagName("html")[0];
const W = mainDiv.clientWidth;	// largeur du domaine
const H = mainDiv.clientHeight;	// hauteur du domaine
var xmax = z0 * W / (2 * d);        // borne max selon X du domaine visible ("au loin")
var ymax = z0 * H / (2 * d);        // borne max selon Y du domaine visible ("au loin")
const threshold = 100;              // seuil au centre, zone privée d'étoile
const threshold_2 = threshold * d;
const opacityMin = .1;              // opacité lorsque le warpDrive est activé
const opacityMax = 1;               // opacité en vitesse nominale
var opacity = opacityMax;
const opacityRate = 0.02;           // taux de variation de l'opacité en phase transitoire

////////////////////
// Initialisation //
////////////////////

var domain = document.getElementById("myCanvas");
domain.width = W;
domain.height = H;
var ctx = domain.getContext('2d');
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, W, H);
ctx.lineCap = 'round';

for (index=0;index<N;index++) {
    reinitialiserParticule(index, true);
}
incrementer();

/////////////////////////////
// Fonctions et procédures //
/////////////////////////////

///////////////////////////////
// Fonction d'initialisation //
///////////////////////////////

function reinitialiserParticule(index, random = false) {
    X[index] = (2*Math.random()-1) * (xmax) * d;
    Y[index] = (2*Math.random()-1) * (ymax) * d;

    while (X[index] < threshold_2 && X[index] > (-1)*threshold_2 && Y[index] < threshold_2 && Y[index] > (-1)*threshold_2) {
        X[index] = (2*Math.random()-1) * (xmax) * d;
    }

    if (random) {
        Z[index] = Math.random() * z0;
    } else {
        Z[index] = z0;
    }
    
}

//////////////////////////
// Intégration en temps //
//////////////////////////

function incrementer() {

    if (warp) {
        if (v < Vmax) {
            v += Acc;
        }
        if (opacity < opacityMin) {
            opacity += opacityRate;
        }
    } else {
        if (v > Vmin) {
            v -= Acc;
        }
        if (opacity < opacityMax) {
            opacity += opacityRate;
        }
    }

    ctx.fillStyle = 'rgba(0,0,0,' + opacity + ')';
    ctx.fillRect(0,0,W,H);

    let dz = v * dt;

    for (i=0;i<N;i++){

        ctx.beginPath();
        ctx.moveTo(X[i] / Z[i] + 0.5*W, 0.5*H - Y[i] / Z[i]);

        Z[i] -= dz;
        if (Z[i] <= 0) {
            Z[i] = Math.abs(X[i]) / W;
        }
        if (rotate) {
            let Xtmp = cosTheta *X[i] - sinTheta*Y[i];
            Y[i] = sinTheta *X[i] + cosTheta*Y[i];
            X[i] = Xtmp;
        }

        var r = Rmin + (Rmax - Rmin) * (z0 - Z[i])/z0;

        xd = X[i]/Z[i] + 0.5*W;
        yd = 0.5*H - Y[i]/Z[i];

        let tone = 255 - Math.floor(Z[i]/z0 * 96);
        ctx.strokeStyle = 'rgb('+tone+','+tone+', 255)';
        ctx.lineWidth = r;
        ctx.lineTo(xd, yd);
        ctx.stroke();
        
        if ( (xd > W + r) || (xd < - r) || (yd > H + r) || (yd < - r) ) {
            reinitialiserParticule(i);
        }

    }

    // lancement retardé de la prochaine itération
    if (run) {
        setTimeout(() => {  incrementer(); }, dt*1000);
    }
    
}

/////////////////////////
// Bouton Marche/Arrêt //
/////////////////////////

var boutonPause = document.getElementById("pause");
boutonPause.addEventListener("click", onClickSurPause, false);

function onClickSurPause() {
    if (run) {
        run = false;
        boutonPause.classList.toggle("running");
    } else {
        run = true;
        boutonPause.classList.toggle("running");
        incrementer();
    }
}

/////////////////
// Bouton Warp //
/////////////////

var boutonWarp = document.getElementById("warp");
boutonWarp.addEventListener("click", onClickSurWarp, false);

function onClickSurWarp() {
    if (warp) {
        warp = false;
    } else {
        warp = true;
        opacity = 0;
    }
}

///////////////////
// Bouton Rotate //
///////////////////

var boutonRotate = document.getElementById("rotate");
boutonRotate.addEventListener("click", onClickSurRotate, false);

function onClickSurRotate() {
    rotate = !rotate;
}

document.addEventListener("DOMContentLoaded", function() {
    boutonPause.click();
});
