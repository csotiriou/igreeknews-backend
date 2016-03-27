/**
 * Created by soulstorm on 1/3/15.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');
var fs = require('fs');
var stemmer = require('../util/lexer.greek.js');
var S = require('string');
var _ = require('underscore');



describe('Text Normalization', function(){
    it('should find some keywords', function(done){

        var text = 'Απίστευτη... μόδα έχει ξεκινήσει ο Κριστιάνο Ρονάλντο, που σιγά- σιγά γίνεται παγκόσμια... Δεν πάει το μυαλό σας τι "σκαρφίστηκε" ο Πορτογάλος άσος της Ρεάλ προκειμένου να βγάλει λεφτά! Διαβάστε περισσότερα εδώ... ';

        var keywordObjectStats = stemmer.keywordsFromText(text);

        keywordObjectStats.keywords.should.containEql('ΡΟΝΑΛΝΤΟ');
        keywordObjectStats.keywords.should.containEql('ΚΡΙΣΤΙΑΝΟ');
        keywordObjectStats.keywords.should.containEql('ΠΟΡΤΟΓΑΛΟΣ');
        keywordObjectStats.keywords.should.containEql('ΡΕΑΛ');

        done();
    });
});


describe('Greek text normalization', function(){
    it('should properly normalize words', function(done){
        "προβληματικοσ".should.equal(stemmer.normalizeGreek("προβληματικός"));
        "γαμιεσαι".should.equal(stemmer.normalizeGreek("γαμιέσαι"));
        "ΠΡΟΣΠΟΙΗΣΙΣ".should.equal(stemmer.normalizeGreek("προσποίησις").toUpperCase());
        done();
    }) ;
});


describe('Greek Stemming', function(){

    it('should display stemmed words', function(done){

        "ΠΡΟΒΛΗΜΑΤΙΚ".should.equal(stemmer.stemWord("ΠΡΟΒΛΗΜΑΤΙΚΟΣ"));
        "ΦΑ".should.equal(stemmer.stemWord("ΦΑΓΙΑ"));
        "ΠΡΟΣΠΟΙ".should.equal(stemmer.stemWord("ΠΡΟΣΠΟΙΟΥΜΑΙ"));
        "ΠΡΟΣΠΟΙ".should.equal(stemmer.stemWord("προσποιουμαι"));
        "ΠΡΟΣΠΟΙ".should.equal(stemmer.stemWord(stemmer.normalizeGreek("προσποιούμαι")));

        done();
    });
});


describe('HTML processing', function(){
    it('should properly find elements inside HTML', function(done){


        var text = 'Οριακή μείωση της ανεργίας καταγράφηκε τον Ιανουάριο, σύμφωνα με την ΕΛΣΤΑΤ. Το εποχικά διορθωµένο ποσοστό ανεργίας τον Ιανουάριο του 2015 ανήλθε σε 25,7% έναντι 27,2% τον Ιανουάριο του 2014 και 25,9% τον ∆εκέµβριο του 2014. Το σύνολο των απασχολουµένων κατά το Ιανουάριο του ...".';

        //console.log('-------------------------------------------');
        //console.log(stemmer.getWordsStartingASentence(text));
        var keywordsStats = stemmer.keywordsFromText(text);
        keywordsStats.keywords.should.containEql('ΙΑΝΟΥΑΡΙΟ');
        keywordsStats.keywords.should.containEql('ΑΝΕΡΓΙΑΣ');

        done();
    });

    it('should find properly the image element', function(done){
        var htmlText = "<description><![CDATA[<table cellpadding='5' cellspacing='0'><tr><td valign=\"top\" ><img src='http://www.real.gr:80/Files/Articles/Photo/118_67_391859.jpg' alt=''  /></td><td valign=\"top\">Τι είπε ο γγ της ΚΕ του ΚΚΕ στην εισηγητική του ομιλία στην ημερίδα του κεντρικού συμβουλίου της ΚΝΕ για τον σχολικό εκφοβισμό.</td></tr></table>]]></description>";
        done();
    });
});


describe('big keyword find',function(){
    it('should find some keywords', function(done){
        var text = "«Το πρόγραμμα ήταν αποτέλεσμα μίας μεγάλης διαδρομής», δήλωσε ο Γάλλος υπουργός Οικονομικών εξερχόμενος από το σημερινό Eurogroup, για να συμπληρώσει:\r\n«Είχαμε θέσει ως αρχή να υπάρξει ένας διπλός σεβασμός. Δεν πρέπει οι Ευρωπαίοι να προσποιούμαστε ότι δεν άλλαξε κάτι στην Ελλάδα μετά τις εκλογές, έπρεπε να προσαρμοστούμε».\r\nΑφού υπογράμμισε, δε, πως χάθηκε πολύτιμος χρόνος, ο κ. Σαπέν σημείωσε: «Και η Ελλάδα από την πλευρά της κλήθηκε να σεβαστεί τους ευρωπαϊκούς κανόνες», κάνοντας επίσης λόγο για σεβασμό και αλληλεγγύη που έπρεπε να επιδείξουν όλες οι πλευρές, «για να μπει η Ελλάδα στο δρόμο της ανάπτυξης».\r\n«Τα κόμματα στην Ελλάδα ανέλαβαν τις ευθύνες τους και η ελληνική κυβέρνηση δείχνει πως ξεκίνησε να εργάζεται ξανά», συνέχισε ο Γάλλος ΥΠΟΙΚ, χαρακτηρίζοντας αναγκαία την ενίσχυση του τραπεζικού τομέα σε επίπεδο ρευστότητας, κάτι που έδινε χαρακτήρα κατεπείγοντος στην έγκριση της συμφωνίας.\r\nΕρωτηθείς, τέλος, σχετικά με τη συμμετοχή του ΔΝΤ, τόνισε ότι το Ταμείο έχει διαφορετικό χρονοδιάγραμμα, ενώ στέκεται κυρίως στη βιωσιμότητα του χρέους. «Κρίθηκε αναγκαίο τον Οκτώβριο να εξετάσουμε το θέμα της βιωσιμότητας του χρέους», εξήγησε και κατέληξε: «Πρέπει να αντιμετωπιστεί το ζήτημα του χρέους, για να καταστεί βιώσιμο», εκτιμώντας ωστόσο ότι δεν χρειάζεται ονομαστική απομείωσή του, αλλά αναδιάρθρωσή του.";
        var keywordsStats = stemmer.keywordsFromText(text);
        console.log(keywordsStats);
    });
});