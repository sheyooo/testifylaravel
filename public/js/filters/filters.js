app.filter('socialCounter', function() {
    return function(num) {
        out = num;
        if (num) {
            if (num >= 999 && num < 999999) {
                out = Math.round(num / 100) / 10 + "K";
            } else if (num >= 999999 && num < 999999999) {
                out = Math.round(num / 100000) / 10 + "M";
            } else if (num >= 999999999) {
                out = Math.round(num / 100000000) / 10 + "B";
            }
        }
        return out;
    };
});
