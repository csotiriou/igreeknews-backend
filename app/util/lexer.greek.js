'use strict';

var S = require('string');
var _ = require('underscore');

var step1list = { 'ΦΑΓΙΑ': 'ΦΑ',
    'ΦΑΓΙΟΥ': 'ΦΑ',
    'ΦΑΓΙΩΝ': 'ΦΑ',
    'ΣΚΑΓΙΑ': 'ΣΚΑ',
    'ΣΚΑΓΙΟΥ': 'ΣΚΑ',
    'ΣΚΑΓΙΩΝ': 'ΣΚΑ',
    'ΟΛΟΓΙΟΥ': 'ΟΛΟ',
    'ΟΛΟΓΙΑ': 'ΟΛΟ',
    'ΟΛΟΓΙΩΝ': 'ΟΛΟ',
    'ΣΟΓΙΟΥ': 'ΣΟ',
    'ΣΟΓΙΑ': 'ΣΟ',
    'ΣΟΓΙΩΝ': 'ΣΟ',
    'ΤΑΤΟΓΙΑ': 'ΤΑΤΟ',
    'ΤΑΤΟΓΙΟΥ': 'ΤΑΤΟ',
    'ΤΑΤΟΓΙΩΝ': 'ΤΑΤΟ',
    'ΚΡΕΑΣ': 'ΚΡΕ',
    'ΚΡΕΑΤΟΣ': 'ΚΡΕ',
    'ΚΡΕΑΤΑ': 'ΚΡΕ',
    'ΚΡΕΑΤΩΝ': 'ΚΡΕ',
    'ΠΕΡΑΣ': 'ΠΕΡ',
    'ΠΕΡΑΤΟΣ': 'ΠΕΡ',
    'ΠΕΡΑΤΑ': 'ΠΕΡ',
    'ΠΕΡΑΤΩΝ': 'ΠΕΡ',
    'ΤΕΡΑΣ': 'ΤΕΡ',
    'ΤΕΡΑΤΟΣ': 'ΤΕΡ',
    'ΤΕΡΑΤΑ': 'ΤΕΡ',
    'ΤΕΡΑΤΩΝ': 'ΤΕΡ',
    'ΦΩΣ': 'ΦΩ',
    'ΦΩΤΟΣ': 'ΦΩ',
    'ΦΩΤΑ': 'ΦΩ',
    'ΦΩΤΩΝ': 'ΦΩ',
    'ΚΑΘΕΣΤΩΣ': 'ΚΑΘΕΣΤ',
    'ΚΑΘΕΣΤΩΤΟΣ': 'ΚΑΘΕΣΤ',
    'ΚΑΘΕΣΤΩΤΑ': 'ΚΑΘΕΣΤ',
    'ΚΑΘΕΣΤΩΤΩΝ': 'ΚΑΘΕΣΤ',
    'ΓΕΓΟΝΟΣ': 'ΓΕΓΟΝ',
    'ΓΕΓΟΝΟΤΟΣ': 'ΓΕΓΟΝ',
    'ΓΕΓΟΝΟΤΑ': 'ΓΕΓΟΝ',
    'ΓΕΓΟΝΟΤΩΝ': 'ΓΕΓΟΝ' };


var greekStopWords = [ 'ο',
    'η',
    'το',
    'οι',
    'τα',
    'του',
    'τησ',
    'των',
    'τον',
    'την',
    'και',
    'κι',
    'κ',
    'ειμαι',
    'εισαι',
    'ειναι',
    'ειμαστε',
    'ειστε',
    'στο',
    'στον',
    'στη',
    'στην',
    'μα',
    'αλλα',
    'απο',
    'για',
    'προσ',
    'με',
    'σε',
    'ωσ',
    'παρα',
    'αντι',
    'κατα',
    'μετα',
    'θα',
    'να',
    'δε',
    'δεν',
    'μη',
    'μην',
    'επι',
    'ενω',
    'εαν',
    'αν',
    'τοτε',
    'που',
    'πωσ',
    'ποιοσ',
    'ποια',
    'ποιο',
    'ποιοι',
    'ποιεσ',
    'ποιων',
    'ποιουσ',
    'αυτοσ',
    'αυτη',
    'αυτο',
    'αυτοι',
    'αυτων',
    'αυτουσ',
    'αυτεσ',
    'αυτα',
    'εκεινοσ',
    'εκεινη',
    'εκεινο',
    'εκεινοι',
    'εκεινεσ',
    'εκεινα',
    'εκεινων',
    'εκεινουσ',
    'οπωσ',
    'ομωσ',
    'ισωσ',
    'οσο',
    'οτι',
    'τη',
    'μας',
    'στισ',
    'χωρις',
    //custom, for news
    'ΣΧΕΤΙΚΑ',
    'ΗΤΑΝ',
    'ΕΣΕΙΣ',
    'ΛΕΝΕ',
    'ΛΙΓΟ',
    'ΤΕΤΟΙΑ',
    'ΕΠΕΙΔΗ',
    'ΣΟΚ',
    'ΓΙΑΤΙ',
    'ΔΙΑΒΑΣΤΕ',
    'ΔΕΙΤΕ',
    'ΔΕΣ',
    'ΠΡΙΝ',
    'ΜΕΤΑ',
    'ΕΝΔΙΑΜΕΣΑ',
    'ΕΝΑΣ',
    'ΕΝΑ',
    'ΔΥΟ',
    'ΤΡΕΙΣ',
    'ΤΡΙΑ',
    'ΤΕΣΣΕΡΑ',
    'ΜΕΣΑ'
];

var v = "[ΑΕΗΙΟΥΩ]";	// vowel
var v2 = "[ΑΕΗΙΟΩ]"; //vowel without Y

var capitalStopWords = [];

//convert stopwords to their capitals
_.each(greekStopWords, function(item){
    capitalStopWords.push(item.toUpperCase());
});

/**
 * Greek word stemmer... in beta
 * taken by http://people.dsv.su.se/~hercules/greek_stemmer.gr.html
 *
 * @param w
 * @returns {string}
 */
var stemWord = function(w) {
    w = w.toUpperCase();

    var stem;
    var suffix;
    var firstch;
    var origword = w;
    var test1 = new Boolean(true);

    if (w.length < 4) { return w; }

    var re;
    var re2;
    var re3;
    var re4;



    //Step1

    re = /(.*)(ΦΑΓΙΑ|ΦΑΓΙΟΥ|ΦΑΓΙΩΝ|ΣΚΑΓΙΑ|ΣΚΑΓΙΟΥ|ΣΚΑΓΙΩΝ|ΟΛΟΓΙΟΥ|ΟΛΟΓΙΑ|ΟΛΟΓΙΩΝ|ΣΟΓΙΟΥ|ΣΟΓΙΑ|ΣΟΓΙΩΝ|ΤΑΤΟΓΙΑ|ΤΑΤΟΓΙΟΥ|ΤΑΤΟΓΙΩΝ|ΚΡΕΑΣ|ΚΡΕΑΤΟΣ|ΚΡΕΑΤΑ|ΚΡΕΑΤΩΝ|ΠΕΡΑΣ|ΠΕΡΑΤΟΣ|ΠΕΡΑΤΑ|ΠΕΡΑΤΩΝ|ΤΕΡΑΣ|ΤΕΡΑΤΟΣ|ΤΕΡΑΤΑ|ΤΕΡΑΤΩΝ|ΦΩΣ|ΦΩΤΟΣ|ΦΩΤΑ|ΦΩΤΩΝ|ΚΑΘΕΣΤΩΣ|ΚΑΘΕΣΤΩΤΟΣ|ΚΑΘΕΣΤΩΤΑ|ΚΑΘΕΣΤΩΤΩΝ|ΓΕΓΟΝΟΣ|ΓΕΓΟΝΟΤΟΣ|ΓΕΓΟΝΟΤΑ|ΓΕΓΟΝΟΤΩΝ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        suffix = fp[2];
        w = stem + step1list[suffix];
        test1 = false;
    }


    // Step 2a
    re = /^(.+?)(ΑΔΕΣ|ΑΔΩΝ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;

        var reg1 = /(ΟΚ|ΜΑΜ|ΜΑΝ|ΜΠΑΜΠ|ΠΑΤΕΡ|ΓΙΑΓΙ|ΝΤΑΝΤ|ΚΥΡ|ΘΕΙ|ΠΕΘΕΡ)$/;

        if (!(reg1.test(w))) {w = w + "ΑΔ";}
    }

    //Step 2b
    re2 = /^(.+?)(ΕΔΕΣ|ΕΔΩΝ)$/;

    if (re2.test(w)) {
        var fp = re2.exec(w);
        stem = fp[1];
        w = stem;

        var exept2 = /(ΟΠ|ΙΠ|ΕΜΠ|ΥΠ|ΓΗΠ|ΔΑΠ|ΚΡΑΣΠ|ΜΙΛ)$/;

        if (exept2.test(w)) {w = w + "ΕΔ";}

    }

    //Step 2c
    re3 = /^(.+?)(ΟΥΔΕΣ|ΟΥΔΩΝ)$/;

    if (re3.test(w)) {
        var fp = re3.exec(w);
        stem = fp[1];
        w = stem;

        var exept3 = /(ΑΡΚ|ΚΑΛΙΑΚ|ΠΕΤΑΛ|ΛΙΧ|ΠΛΕΞ|ΣΚ|Σ|ΦΛ|ΦΡ|ΒΕΛ|ΛΟΥΛ|ΧΝ|ΣΠ|ΤΡΑΓ|ΦΕ)$/;

        if (exept3.test(w)) {w = w + "ΟΥΔ";}

    }


    //Step 2d
    re4 = /^(.+?)(ΕΩΣ|ΕΩΝ)$/;

    if (re4.test(w)) {
        var fp = re4.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        var exept4 = /^(Θ|Δ|ΕΛ|ΓΑΛ|Ν|Π|ΙΔ|ΠΑΡ)$/;

        if (exept4.test(w)) {
            w = w + "Ε";

        }
    }

    //Step 3
    re = /^(.+?)(ΙΑ|ΙΟΥ|ΙΩΝ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        re2 = new RegExp (v+"$");
        test1 = false;

        if (re2.test(w)) {
            w = stem + "Ι";
        }

    }


    //Step 4
    re = /^(.+?)(ΙΚΑ|ΙΚΟ|ΙΚΟΥ|ΙΚΩΝ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        re2 = new RegExp (v+"$");
        var exept5 = /^(ΑΛ|ΑΔ|ΕΝΔ|ΑΜΑΝ|ΑΜΜΟΧΑΛ|ΗΘ|ΑΝΗΘ|ΑΝΤΙΔ|ΦΥΣ|ΒΡΩΜ|ΓΕΡ|ΕΞΩΔ|ΚΑΛΠ|ΚΑΛΛΙΝ|ΚΑΤΑΔ|ΜΟΥΛ|ΜΠΑΝ|ΜΠΑΓΙΑΤ|ΜΠΟΛ|ΜΠΟΣ|ΝΙΤ|ΞΙΚ|ΣΥΝΟΜΗΛ|ΠΕΤΣ|ΠΙΤΣ|ΠΙΚΑΝΤ|ΠΛΙΑΤΣ|ΠΟΣΤΕΛΝ|ΠΡΩΤΟΔ|ΣΕΡΤ|ΣΥΝΑΔ|ΤΣΑΜ|ΥΠΟΔ|ΦΙΛΟΝ|ΦΥΛΟΔ|ΧΑΣ)$/;

        if ((exept5.test(w)) || (re2.test(w))){
            w = w + "ΙΚ";
        }
    }

    //step 5a
    re = /^(.+?)(ΑΜΕ)$/;
    re2 = /^(.+?)(ΑΓΑΜΕ|ΗΣΑΜΕ|ΟΥΣΑΜΕ|ΗΚΑΜΕ|ΗΘΗΚΑΜΕ)$/;
    if (w == "ΑΓΑΜΕ"){w = "ΑΓΑΜ";}

    if (re2.test(w)) {
        var fp = re2.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;
    }



    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        var exept6 = /^(ΑΝΑΠ|ΑΠΟΘ|ΑΠΟΚ|ΑΠΟΣΤ|ΒΟΥΒ|ΞΕΘ|ΟΥΛ|ΠΕΘ|ΠΙΚΡ|ΠΟΤ|ΣΙΧ|Χ)$/;

        if (exept6.test(w)){
            w = w + "ΑΜ";
        }
    }


    //Step 5b
    re2 = /^(.+?)(ΑΝΕ)$/;
    re3 = /^(.+?)(ΑΓΑΝΕ|ΗΣΑΝΕ|ΟΥΣΑΝΕ|ΙΟΝΤΑΝΕ|ΙΟΤΑΝΕ|ΙΟΥΝΤΑΝΕ|ΟΝΤΑΝΕ|ΟΤΑΝΕ|ΟΥΝΤΑΝΕ|ΗΚΑΝΕ|ΗΘΗΚΑΝΕ)$/;

    if (re3.test(w)) {
        var fp = re3.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        re3 = /^(ΤΡ|ΤΣ)$/;

        if (re3.test(w)) {
            w = w + "ΑΓΑΝ";
        }
    }


    if (re2.test(w)) {
        var fp = re2.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        re2 = new RegExp (v2 +"$");
        var exept7 = /^(ΒΕΤΕΡ|ΒΟΥΛΚ|ΒΡΑΧΜ|Γ|ΔΡΑΔΟΥΜ|Θ|ΚΑΛΠΟΥΖ|ΚΑΣΤΕΛ|ΚΟΡΜΟΡ|ΛΑΟΠΛ|ΜΩΑΜΕΘ|Μ|ΜΟΥΣΟΥΛΜ|Ν|ΟΥΛ|Π|ΠΕΛΕΚ|ΠΛ|ΠΟΛΙΣ|ΠΟΡΤΟΛ|ΣΑΡΑΚΑΤΣ|ΣΟΥΛΤ|ΤΣΑΡΛΑΤ|ΟΡΦ|ΤΣΙΓΓ|ΤΣΟΠ|ΦΩΤΟΣΤΕΦ|Χ|ΨΥΧΟΠΛ|ΑΓ|ΟΡΦ|ΓΑΛ|ΓΕΡ|ΔΕΚ|ΔΙΠΛ|ΑΜΕΡΙΚΑΝ|ΟΥΡ|ΠΙΘ|ΠΟΥΡΙΤ|Σ|ΖΩΝΤ|ΙΚ|ΚΑΣΤ|ΚΟΠ|ΛΙΧ|ΛΟΥΘΗΡ|ΜΑΙΝΤ|ΜΕΛ|ΣΙΓ|ΣΠ|ΣΤΕΓ|ΤΡΑΓ|ΤΣΑΓ|Φ|ΕΡ|ΑΔΑΠ|ΑΘΙΓΓ|ΑΜΗΧ|ΑΝΙΚ|ΑΝΟΡΓ|ΑΠΗΓ|ΑΠΙΘ|ΑΤΣΙΓΓ|ΒΑΣ|ΒΑΣΚ|ΒΑΘΥΓΑΛ|ΒΙΟΜΗΧ|ΒΡΑΧΥΚ|ΔΙΑΤ|ΔΙΑΦ|ΕΝΟΡΓ|ΘΥΣ|ΚΑΠΝΟΒΙΟΜΗΧ|ΚΑΤΑΓΑΛ|ΚΛΙΒ|ΚΟΙΛΑΡΦ|ΛΙΒ|ΜΕΓΛΟΒΙΟΜΗΧ|ΜΙΚΡΟΒΙΟΜΗΧ|ΝΤΑΒ|ΞΗΡΟΚΛΙΒ|ΟΛΙΓΟΔΑΜ|ΟΛΟΓΑΛ|ΠΕΝΤΑΡΦ|ΠΕΡΗΦ|ΠΕΡΙΤΡ|ΠΛΑΤ|ΠΟΛΥΔΑΠ|ΠΟΛΥΜΗΧ|ΣΤΕΦ|ΤΑΒ|ΤΕΤ|ΥΠΕΡΗΦ|ΥΠΟΚΟΠ|ΧΑΜΗΛΟΔΑΠ|ΨΗΛΟΤΑΒ)$/;

        if ((re2.test(w)) || (exept7.test(w))){
            w = w + "ΑΝ";
        }
    }


    //Step 5c
    re3 = /^(.+?)(ΕΤΕ)$/;
    re4 = /^(.+?)(ΗΣΕΤΕ)$/;

    if (re4.test(w)) {
        var fp = re4.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;
    }




    if (re3.test(w)) {
        var fp = re3.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        re3 = new RegExp (v2 +"$");
        var exept8 =  /(ΟΔ|ΑΙΡ|ΦΟΡ|ΤΑΘ|ΔΙΑΘ|ΣΧ|ΕΝΔ|ΕΥΡ|ΤΙΘ|ΥΠΕΡΘ|ΡΑΘ|ΕΝΘ|ΡΟΘ|ΣΘ|ΠΥΡ|ΑΙΝ|ΣΥΝΔ|ΣΥΝ|ΣΥΝΘ|ΧΩΡ|ΠΟΝ|ΒΡ|ΚΑΘ|ΕΥΘ|ΕΚΘ|ΝΕΤ|ΡΟΝ|ΑΡΚ|ΒΑΡ|ΒΟΛ|ΩΦΕΛ)$/;
        var exept9 = /^(ΑΒΑΡ|ΒΕΝ|ΕΝΑΡ|ΑΒΡ|ΑΔ|ΑΘ|ΑΝ|ΑΠΛ|ΒΑΡΟΝ|ΝΤΡ|ΣΚ|ΚΟΠ|ΜΠΟΡ|ΝΙΦ|ΠΑΓ|ΠΑΡΑΚΑΛ|ΣΕΡΠ|ΣΚΕΛ|ΣΥΡΦ|ΤΟΚ|Υ|Δ|ΕΜ|ΘΑΡΡ|Θ)$/;

        if ((re3.test(w)) || (exept8.test(w)) || (exept9.test(w))){
            w = w + "ΕΤ";
        }
    }

    //Step 5d
    re = /^(.+?)(ΟΝΤΑΣ|ΩΝΤΑΣ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        var exept10 = /^(ΑΡΧ)$/;
        var exept11 = /(ΚΡΕ)$/;
        if (exept10.test(w)){
            w = w + "ΟΝΤ";
        }
        if (exept11.test(w)){
            w = w + "ΩΝΤ";
        }
    }

    //Step 5e
    re = /^(.+?)(ΟΜΑΣΤΕ|ΙΟΜΑΣΤΕ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        var exept11 = /^(ΟΝ)$/;

        if (exept11.test(w)){
            w = w + "ΟΜΑΣΤ";
        }
    }

    //Step 5f
    re = /^(.+?)(ΕΣΤΕ)$/;
    re2 = /^(.+?)(ΙΕΣΤΕ)$/;

    if (re2.test(w)) {
        var fp = re2.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        re2 = /^(Π|ΑΠ|ΣΥΜΠ|ΑΣΥΜΠ|ΑΚΑΤΑΠ|ΑΜΕΤΑΜΦ)$/;

        if (re2.test(w)){
            w = w + "ΙΕΣΤ";
        }
    }

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        var exept12 = /^(ΑΛ|ΑΡ|ΕΚΤΕΛ|Ζ|Μ|Ξ|ΠΑΡΑΚΑΛ|ΑΡ|ΠΡΟ|ΝΙΣ)$/;

        if (exept12.test(w)){
            w = w + "ΕΣΤ";
        }
    }


    //Step 5g
    re = /^(.+?)(ΗΚΑ|ΗΚΕΣ|ΗΚΕ)$/;
    re2 = /^(.+?)(ΗΘΗΚΑ|ΗΘΗΚΕΣ|ΗΘΗΚΕ)$/;

    if (re2.test(w)){
        var fp = re2.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;
    }

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        var exept13 = /(ΣΚΩΛ|ΣΚΟΥΛ|ΝΑΡΘ|ΣΦ|ΟΘ|ΠΙΘ)$/;
        var exept14 = /^(ΔΙΑΘ|Θ|ΠΑΡΑΚΑΤΑΘ|ΠΡΟΣΘ|ΣΥΝΘ|)$/;

        if ((exept13.test(w)) || (exept14.test(w))){
            w = w + "ΗΚ";
        }
    }


    //Step 5h
    re = /^(.+?)(ΟΥΣΑ|ΟΥΣΕΣ|ΟΥΣΕ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        var exept15 = /^(ΦΑΡΜΑΚ|ΧΑΔ|ΑΓΚ|ΑΝΑΡΡ|ΒΡΟΜ|ΕΚΛΙΠ|ΛΑΜΠΙΔ|ΛΕΧ|Μ|ΠΑΤ|Ρ|Λ|ΜΕΔ|ΜΕΣΑΖ|ΥΠΟΤΕΙΝ|ΑΜ|ΑΙΘ|ΑΝΗΚ|ΔΕΣΠΟΖ|ΕΝΔΙΑΦΕΡ|ΔΕ|ΔΕΥΤΕΡΕΥ|ΚΑΘΑΡΕΥ|ΠΛΕ|ΤΣΑ)$/;
        var exept16 = /(ΠΟΔΑΡ|ΒΛΕΠ|ΠΑΝΤΑΧ|ΦΡΥΔ|ΜΑΝΤΙΛ|ΜΑΛΛ|ΚΥΜΑΤ|ΛΑΧ|ΛΗΓ|ΦΑΓ|ΟΜ|ΠΡΩΤ)$/;

        if ((exept15.test(w)) || (exept16.test(w))){
            w = w + "ΟΥΣ";
        }
    }


    //Step 5i
    re = /^(.+?)(ΑΓΑ|ΑΓΕΣ|ΑΓΕ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        var exept17 = /^(ΨΟΦ|ΝΑΥΛΟΧ)$/;
        var exept20 = /(ΚΟΛΛ)$/;
        var exept18 = /^(ΑΒΑΣΤ|ΠΟΛΥΦ|ΑΔΗΦ|ΠΑΜΦ|Ρ|ΑΣΠ|ΑΦ|ΑΜΑΛ|ΑΜΑΛΛΙ|ΑΝΥΣΤ|ΑΠΕΡ|ΑΣΠΑΡ|ΑΧΑΡ|ΔΕΡΒΕΝ|ΔΡΟΣΟΠ|ΞΕΦ|ΝΕΟΠ|ΝΟΜΟΤ|ΟΛΟΠ|ΟΜΟΤ|ΠΡΟΣΤ|ΠΡΟΣΩΠΟΠ|ΣΥΜΠ|ΣΥΝΤ|Τ|ΥΠΟΤ|ΧΑΡ|ΑΕΙΠ|ΑΙΜΟΣΤ|ΑΝΥΠ|ΑΠΟΤ|ΑΡΤΙΠ|ΔΙΑΤ|ΕΝ|ΕΠΙΤ|ΚΡΟΚΑΛΟΠ|ΣΙΔΗΡΟΠ|Λ|ΝΑΥ|ΟΥΛΑΜ|ΟΥΡ|Π|ΤΡ|Μ)$/;
        var exept19 = /(ΟΦ|ΠΕΛ|ΧΟΡΤ|ΛΛ|ΣΦ|ΡΠ|ΦΡ|ΠΡ|ΛΟΧ|ΣΜΗΝ)$/;

        if (((exept18.test(w)) || (exept19.test(w)))  && !((exept17.test(w)) || (exept20.test(w)))){
            w = w + "ΑΓ";
        }
    }


    //Step 5j
    re = /^(.+?)(ΗΣΕ|ΗΣΟΥ|ΗΣΑ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        var exept21 = /^(Ν|ΧΕΡΣΟΝ|ΔΩΔΕΚΑΝ|ΕΡΗΜΟΝ|ΜΕΓΑΛΟΝ|ΕΠΤΑΝ)$/;

        if (exept21.test(w)){
            w = w + "ΗΣ";
        }
    }

    //Step 5k
    re = /^(.+?)(ΗΣΤΕ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        var exept22 = /^(ΑΣΒ|ΣΒ|ΑΧΡ|ΧΡ|ΑΠΛ|ΑΕΙΜΝ|ΔΥΣΧΡ|ΕΥΧΡ|ΚΟΙΝΟΧΡ|ΠΑΛΙΜΨ)$/;

        if (exept22.test(w)){
            w = w + "ΗΣΤ";
        }
    }

    //Step 5l
    re = /^(.+?)(ΟΥΝΕ|ΗΣΟΥΝΕ|ΗΘΟΥΝΕ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        var exept23 = /^(Ν|Ρ|ΣΠΙ|ΣΤΡΑΒΟΜΟΥΤΣ|ΚΑΚΟΜΟΥΤΣ|ΕΞΩΝ)$/;

        if (exept23.test(w)){
            w = w + "ΟΥΝ";
        }
    }

    //Step 5l
    re = /^(.+?)(ΟΥΜΕ|ΗΣΟΥΜΕ|ΗΘΟΥΜΕ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
        test1 = false;

        var exept24 = /^(ΠΑΡΑΣΟΥΣ|Φ|Χ|ΩΡΙΟΠΛ|ΑΖ|ΑΛΛΟΣΟΥΣ|ΑΣΟΥΣ)$/;

        if (exept24.test(w)){
            w = w + "ΟΥΜ";
        }
    }



    // Step 6

    re=/^(.+?)(ΜΑΤΑ|ΜΑΤΩΝ|ΜΑΤΟΣ)$/;
    re2 = /^(.+?)(Α|ΑΓΑΤΕ|ΑΓΑΝ|ΑΕΙ|ΑΜΑΙ|ΑΝ|ΑΣ|ΑΣΑΙ|ΑΤΑΙ|ΑΩ|Ε|ΕΙ|ΕΙΣ|ΕΙΤΕ|ΕΣΑΙ|ΕΣ|ΕΤΑΙ|Ι|ΙΕΜΑΙ|ΙΕΜΑΣΤΕ|ΙΕΤΑΙ|ΙΕΣΑΙ|ΙΕΣΑΣΤΕ|ΙΟΜΑΣΤΑΝ|ΙΟΜΟΥΝ|ΙΟΜΟΥΝΑ|ΙΟΝΤΑΝ|ΙΟΝΤΟΥΣΑΝ|ΙΟΣΑΣΤΑΝ|ΙΟΣΑΣΤΕ|ΙΟΣΟΥΝ|ΙΟΣΟΥΝΑ|ΙΟΤΑΝ|ΙΟΥΜΑ|ΙΟΥΜΑΣΤΕ|ΙΟΥΝΤΑΙ|ΙΟΥΝΤΑΝ|Η|ΗΔΕΣ|ΗΔΩΝ|ΗΘΕΙ|ΗΘΕΙΣ|ΗΘΕΙΤΕ|ΗΘΗΚΑΤΕ|ΗΘΗΚΑΝ|ΗΘΟΥΝ|ΗΘΩ|ΗΚΑΤΕ|ΗΚΑΝ|ΗΣ|ΗΣΑΝ|ΗΣΑΤΕ|ΗΣΕΙ|ΗΣΕΣ|ΗΣΟΥΝ|ΗΣΩ|Ο|ΟΙ|ΟΜΑΙ|ΟΜΑΣΤΑΝ|ΟΜΟΥΝ|ΟΜΟΥΝΑ|ΟΝΤΑΙ|ΟΝΤΑΝ|ΟΝΤΟΥΣΑΝ|ΟΣ|ΟΣΑΣΤΑΝ|ΟΣΑΣΤΕ|ΟΣΟΥΝ|ΟΣΟΥΝΑ|ΟΤΑΝ|ΟΥ|ΟΥΜΑΙ|ΟΥΜΑΣΤΕ|ΟΥΝ|ΟΥΝΤΑΙ|ΟΥΝΤΑΝ|ΟΥΣ|ΟΥΣΑΝ|ΟΥΣΑΤΕ|Υ|ΥΣ|Ω|ΩΝ)$/;

    if (re.test(w)) {
        var fp = re.exec(w);
        stem = fp[1];
        w = stem + "ΜΑ";
    }

    if ((re2.test(w))&&(test1)){
        var fp = re2.exec(w);
        stem = fp[1];
        w = stem;
    }

    // Step 7 (ΠΑΡΑΘΕΤΙΚΑ)

    re = /^(.+?)(ΕΣΤΕΡ|ΕΣΤΑΤ|ΟΤΕΡ|ΟΤΑΤ|ΥΤΕΡ|ΥΤΑΤ|ΩΤΕΡ|ΩΤΑΤ)$/;

    if (re.test(w)){
        var fp = re.exec(w);
        stem = fp[1];
        w = stem;
    }

    return w;
};


/**
 * Modern greek normalization
 * @param text
 * @returns {*}
 */
var normalizeGreek = function(text) {
    if (!text){
        return "";
    }
    text = text.replace(/ά/g,'α');
    text = text.replace(/έ/g,'ε');
    text = text.replace(/ή/g,'η');
    text = text.replace(/ί|ΐ|ϊ/g,'ι');
    text = text.replace(/ό/g,'ο');
    text = text.replace(/ύ|ΰ|ϋ/g,'υ');
    text = text.replace(/ώ/g,'ω');
    text = text.replace(/Σ|ς/g,'σ');

    text = text.replace(/Ά|Α/g,'Α');
    text = text.replace(/Έ|Ε/g,'Ε');
    text = text.replace(/Ή|Η/g,'Η');
    text = text.replace(/Ί|Ϊ|Ι/g,'Ι');
    text = text.replace(/Ό|Ο/g,'Ο');
    text = text.replace(/Ύ|Ϋ|Υ/g,'Υ');
    text = text.replace(/Ώ|Ω/g,'Ω');

    text = text.replace(/([Α-Ωα-ωA-Za-z])-([Α-Ωα-ωA-Za-z])/gi, '$1 $2');

    return text;
};


/**
 * Polytonic normalization
 * @param text
 * @returns {*}
 */
var normalizePolytonicGreek = function(text) {
    text = text.replace(/Ά|Α|ά|ἀ|ἁ|ἂ|ἃ|ἄ|ἅ|ἆ|ἇ|ὰ|ά|ᾀ|ᾁ|ᾂ|ᾃ|ᾄ|ᾅ|ᾆ|ᾇ|ᾰ|ᾱ|ᾲ|ᾳ|ᾴ|ᾶ|ᾷ|Ἀ|Ἁ|Ἂ|Ἃ|Ἄ|Ἅ|Ἆ|Ἇ|ᾈ|ᾉ|ᾊ|ᾋ|ᾌ|ᾍ|ᾎ|ᾏ|Ᾰ|Ᾱ|Ὰ|Ά|ᾼ/g,'α');
    text = text.replace(/Έ|Ε|έ|ἐ|ἑ|ἒ|ἓ|ἔ|ἕ|ὲ|έ|Ἐ|Ἑ|Ἒ|Ἓ|Ἔ|Ἕ|Ὲ|Έ/g,'ε');
    text = text.replace(/Ή|Η|ή|ἠ|ἡ|ἢ|ἣ|ἤ|ἥ|ἦ|ἧ|ὴ|ή|ᾐ|ᾑ|ᾒ|ᾓ|ᾔ|ᾕ|ᾖ|ᾗ|ῂ|ῃ|ῄ|ῆ|ῇ|Ἠ|Ἡ|Ἢ|Ἣ|Ἤ|Ἥ|Ἦ|Ἧ|ᾘ|ᾙ|ᾚ|ᾛ|ᾜ|ᾝ|ᾞ|ᾟ|Ὴ|Ή|ῌ/g,'η');
    text = text.replace(/Ί|Ϊ|Ι|ί|ΐ|ἰ|ἱ|ἲ|ἳ|ἴ|ἵ|ἶ|ἷ|ὶ|ί|ῐ|ῑ|ῒ|ΐ|ῖ|ῗ|Ἰ|Ἱ|Ἲ|Ἳ|Ἴ|Ἵ|Ἶ|Ἷ|Ῐ|Ῑ|Ὶ|Ί/g,'ι');
    text = text.replace(/Ό|Ο|ό|ὀ|ὁ|ὂ|ὃ|ὄ|ὅ|ὸ|ό|Ὀ|Ὁ|Ὂ|Ὃ|Ὄ|Ὅ|Ὸ|Ό/g,'ο');
    text = text.replace(/Ύ|Ϋ|Υ|ΰ|ϋ|ύ|ὐ|ὑ|ὒ|ὓ|ὔ|ὕ|ὖ|ὗ|ὺ|ύ|ῠ|ῡ|ῢ|ΰ|ῦ|ῧ|Ὑ|Ὓ|Ὕ|Ὗ|Ῠ|Ῡ|Ὺ|Ύ/g,'υ');
    text = text.replace(/Ώ|Ω|ώ|ὠ|ὡ|ὢ|ὣ|ὤ|ὥ|ὦ|ὧ|ὼ|ώ|ᾠ|ᾡ|ᾢ|ᾣ|ᾤ|ᾥ|ᾦ|ᾧ|ῲ|ῳ|ῴ|ῶ|ῷ|Ὠ|Ὡ|Ὢ|Ὣ|Ὤ|Ὥ|Ὦ|Ὧ|ᾨ|ᾩ|ᾪ|ᾫ|ᾬ|ᾭ|ᾮ|ᾯ|Ὼ|Ώ|ῼ/g,'ω');
    text = text.replace(/ῤ|ῥ|Ῥ/g,'ρ');
    text = text.replace(/Σ|ς/g,'σ');
    return text;
};


var stripPunctuation = function(string){
    string = string.replace(/[\.]/g, ' ');
    string = string.replace(/  /g, ' ');

    var punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~«]/g;
    var spaceRE = /\s+/g;
    //var string = string;


    return string.replace(punctRE, '').replace(spaceRE, ' ');
};




/**
 * Extracts keywords from text
 * @param text
 * @returns {{names: T[], keywords: Array.<T>, stemmed: string, stats}}
 */
var keywordsFromText = function(text){
    var maximumKeywordCount = 10;
    var minimumAcceptableKeywordLength = 4;

    //normalize the text, remove punctuation
    var normalizedText = normalizeGreek(text);
    var keywordsStartingASentence = getWordsStartingASentence(normalizedText);
    var textWithoutPunctuation = stripPunctuation(normalizedText);
    var strippedPunctuation = textWithoutPunctuation.toUpperCase();


    //get the words contained in the text but without stopwords
    var withoutStopText = strippedPunctuation.split(' ').filter(function(item){
        return item.length > 4 && capitalStopWords.indexOf(item) < 0;
    });


    //and get the names contained in the text without punctuation. We need them to contain the case
    var names = textWithoutPunctuation.split(' ').filter(function(item) {
        if (!item || item.length < minimumAcceptableKeywordLength || keywordsStartingASentence.indexOf(item) != -1){
            return false;
        }
        var uppercase = item.toUpperCase();

        return item[0] === item[0].toUpperCase() && capitalStopWords.indexOf(uppercase) < 0 && !/\d/.test(item);
    });


    //stem count
    var stemmed = _.map(withoutStopText, function(item){
        return stemWord(item);
    }).filter(function(item){
        return item.length > 4;
    }).join(' ');


    var wordStatistics = wordStats(stemmed);
    var wordsMoreThan1 = _.partition(wordStatistics, function(item){
        return item.occurrence > 1;
    })[0];


    var finalKeywords = [].concat(_.map(names, function(name){
        return name.toUpperCase();
    })); //force creation of a new array

    //console.log("---------------------");
    //console.log(finalKeywords);
    //console.log("---------------------");

    if (finalKeywords.length > maximumKeywordCount){
        finalKeywords = finalKeywords.slice(0,maximumKeywordCount);

    }

    if (finalKeywords.length < maximumKeywordCount){
        var i = wordsMoreThan1.length-1;

        while(finalKeywords.length < maximumKeywordCount && i >= 0 ){
            finalKeywords.push(wordsMoreThan1[i].word);
            i--;
        }
    }

    //now, include the original keywords that correspond to the possibly stemmed keywords
    _.each(finalKeywords, function(keyword){
        _.each(withoutStopText, function(originalWord){
            if (originalWord.indexOf(keyword) >= 0){
                finalKeywords.push(originalWord);
            }
        });
    });


    return {names : _.uniq(names), keywords : _.uniq(finalKeywords), stemmed : stemmed, stats: wordStatistics};
};


/**
 * Shows word statistics from a chunk of text. Counts stemmed word occurrences that comprise a text. All results are in capital.
 * @param text
 * @returns {Array}
 */
var wordStats = function(text){

    return wordArrayStats(text.split(' '));
};

var wordArrayStats = function(arrayOfWords){

    var textStats = {};
    var textArrayOccurence = [];

    arrayOfWords.forEach(function(item){
        var current = textStats[item];
        if (!current){
            current = 0;
        }
        textStats[item] = current + 1;
    });

    _.each(textStats, function(value, key){
        textArrayOccurence.push({word : key, occurrence : value});
    });

    var result = _.sortBy(textArrayOccurence, 'occurrence');

    return result;
};

var getWordsStartingASentence = function(text){
    var regex = new RegExp(".{0,}?(?:\\.|!|\\?)(?:(?=\\ ?[A-ZΑ-Ω0-9])|$)", "g");
    var match;
    var result = [];
    while ((match = regex.exec(text)) != null) {
        // javascript RegExp has a bug when the match has length 0
        if (match.index === regex.lastIndex) {
            ++regex.lastIndex;
        }
        // the match variable is an array that contains the matching groups
        result.push(match[0].substring(0, match[0].indexOf(' ', 1)));
    }
    return result;
};

exports.getWordsStartingASentence = getWordsStartingASentence;
exports.greekStopWords = greekStopWords;
exports.stemWord = stemWord;
exports.wordStats = wordStats;
exports.keywordsFromText = keywordsFromText;
exports.stripPunctuation = stripPunctuation;
exports.normalizeGreek = normalizeGreek;
